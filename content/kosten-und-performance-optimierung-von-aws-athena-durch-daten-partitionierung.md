---
date: 2024-09-30T00:00:01+02:00
lastmod: 2024-09-30T00:00:01+02:00
title: "Kosten und Performance-Optimierung von Amazon Athena durch Daten-Partitionierung"
description: "Durch die physische Aufteilung von Athena-Daten nach logischen Kriterien wie Jahr, Monat und Tag lässt sich die Abfrageeffizienz erheblich steigern, da nur relevante Datenblöcke gescannt werden müssen. Dies resultiert in signifikant geringeren Abfragezeiten und Betriebskosten."
authors: ["manuelkiessling"]
slug: 2024/09/30/kosten-und-performance-optimierung-von-amazon-athena-durch-daten-partitionierung
lang: de
---

# Einführung & Kontext

Bei [JOBOO](https://www.joboo.de) arbeiten wir stark datengetrieben, indem alle unsere Anwendungsplattformen sogenannte Event-Daten aus den Bereichen *Geschäftsvorfälle* ("ein User hat sich registriert", "ein User hat ein Abonnement abgeschlossen"), *Anwendung* ("einem User wurde eine E-Mail zugestellt", "ein Fehler ist aufgetreten"), *Webaufrufe* ("Seite X wurde mit diesen und jenen Parametern aufgerufen"), *Conversion-Tracking* ("User hat ein Kampagnenziel erreicht") — und einigen weiteren Bereichen — kontinuierlich an unser Data Warehouse streamen.

Das Data Warehouse basiert dabei auf einem stark AWS-lastigen Tech-Stack in einer Architektur, bei der mehrere Managed Services wie *Amazon Data Firehose*, *S3*, und *Amazon Athena* miteinander integriert werden.

Der Event-Datenstrom fließt dabei über einen von Data Firehose bereitgestellten HTTP-Endpunkt in Form von einzelnen JSON-strukturierten Ereignis-Datensätzen in das Data Warehouse ein, wo diese Datensätze zu [Apache Parquet](https://parquet.apache.org/) Dateien konvertiert und dann in S3 abgelegt werden.

Von dort können diese Datensätze mittels Athena per SQL abgefragt werden, mit allen Möglichkeiten der Aggregation, Assoziation, Filterung und Transformation, die SQL bietet.

Diese Pipeline bietet die Grundlage für alle weiteren Analysen und Auswertungen.



# Die Problemstellung

Aufgrund der Vielzahl an erfassten Ereignissen in unserer stetig wachsenden Plattform fallen mittlerweile große Mengen von Ereignissen an, und damit einhergehend entsprechend große Datenmengen.

Und ohne weiteres Zutun werden sämtliche von Amazon Data Firehose erzeugten Parquet-Dateien aus Sicht von Athena im Moment einer SQL Abfrage im Wesentlichen als ein einziger großer, unsortierter "Datenklumpen" betrachtet.

Es spricht zwar für die Abfrage-Engine von Athena, im Zweifel auch mit diesen Strukturen umgehen zu können, jedoch skaliert dies auf der Kostenseite schlecht, da beim "pay-per-use" Kostenmodell von Athena stets immer die Menge der für einen SQL Query zu scannenden Daten als Grundlage für die Gebührenberechnung dient.

Auch entwickelt sich die Abfragedauer mit jedem neuen Datensatz linear fort, selbst wenn sich die gesuchte Antwort zu einer Abfrage letztlich nur in einigen wenigen Kilobytes an Daten befinden sollte.

Die Abfrage von Ereignisdaten erfolgt dabei oft fachlich strukturiert und limitiert nach Zeit, beispielsweise im Sinne von "Berechne die Anzahl aller Neuregistrierungen der vergangen 7 Tage".

Diese Form der logischen Strukturierung in der Abfrage resultiert ohne Weiteres aber nicht in einer Optimierung der Abfrage-Effizienz, wenn die physische Struktur der abgelegten Ereignis-Daten dies nicht unterstützt.

Man kann sich dies in etwa so vorstellen, als würde man einen Raum mit einer völlig unsortierten Sammlung von Büchern der letzten 200 Jahre betreten.

Obwohl man zum Beispiel lediglich die Titel aller Kriminalromane aus dem Jahr 1998 ermitteln möchte, wäre man dennoch gezwungen, jedes einzelne Buch einmal in die Hand zu nehmen und auf die Eigenschaften "ist von 1998" und "ist ein Kriminalroman" zu untersuchen — die Limitierung in der Abfrage führt also nicht ohne Weiteres zu einer Limitierung des Abfrage-*Aufwands*.

# Der Lösungsansatz

Wären die Bücher im Raum aber physisch nach einem logischen Kriterium partitioniert — zum Beispiel: alle Bücher eines Jahres stehen immer in einem eigenen Regal für dieses Erscheinungsjahr — dann wäre die Ermittlung der gewünschten Titel viel effizienter, da man jetzt nur noch alle Bücher vom Regal "1998" auf die Eigenschaft "ist ein Kriminalroman" untersuchen muss.

Eine fundamentale Verbesserung der Situation kann also herbeigeführt werden, indem eine Partitionierung der physischen Daten nach logischen Gesichtspunkten erfolgt.

Dies wird von allen beteiligten Komponenten — Data Firehose, S3, und Athena — nativ unterstützt.

Die Lösung liegt hierbei konkret darin, eine für typische Abfrage-Use-Cases sinnvolle logische Aufteilung zu identifizieren — zum Beispiel die Aufspaltung der Daten pro Kalendertag — und diese Aufteilung dann physisch abzubilden, beispielsweise durch eine S3 Ordnerhierarchie nach dem Schema `Jahr/Monat/Tag/`.

Beispiel:

Die Parquet-Dateien liegen durch die Anwendung einer Partitionierung in dieser Struktur in S3 vor:

    datawarehouse/
        business-events/
            year=2024/
                month=09/
                    day=01/
                        file1.parquet
                        file2.parquet
                        file3.parquet
                    day=02/
                        file4.parquet
                        file5.parquet

Es liegen somit Ereignisdaten in insgesamt 5 Dateien vor:

    datawarehouse/business-events/year=2024/month=09/day=01/file1.parquet
    datawarehouse/business-events/year=2024/month=09/day=01/file2.parquet
    datawarehouse/business-events/year=2024/month=09/day=01/file3.parquet
    datawarehouse/business-events/year=2024/month=09/day=02/file4.parquet
    datawarehouse/business-events/year=2024/month=09/day=02/file5.parquet


## Partitionierung während der Abfrage (Athena-Sicht)

Die Optimierung zur Abfragezeit gelingt nun, weil Athena diese 3-stufige Ordnerstruktur erfassen und gezielt abfragen kann; der key=value Aufbau der Verzeichnisnamen und einige andere Maßnahmen (die im weiteren Verlauf detailliert erläutert werden) ermöglichen genau das.

Eine Abfrage der folgenden Art:

    SELECT COUNT(*) FROM business_events
    
    WHERE year  = '2024'
    AND   month = '09'
    AND   day   = '02'

hat dann nicht nur auf SQL-Ebene eine bestimmte Filterung des Resultsets zur Folge, sondern wirkt sich auch beim Zugriffsmuster auf die physischen Dateien in S3 aus: Dank der Partitionierung versteht Athena, dass nur die beiden Dateien 

    datawarehouse/business-events/year=2024/month=09/day=02/file4.parquet
    datawarehouse/business-events/year=2024/month=09/day=02/file5.parquet

physisch gelesen werden müssen, um die Anfrage fachlich korrekt und vollständig zu beantworten. Alle anderen Dateien können gefahrlos ignoriert werden — das ist der Effizienzgewinn.

Das Verfahren der Partitionierung basiert also darauf, dass eine Athenatabelle drei Spalten — `year`, `month`, `day` — besitzt, die nicht nur die eigentlichen Datums-Nutzdaten enthalten, sondern zusätzlich auch auf die drei Unterordner in S3 "gemappt" sind.

Um dies zu erreichen, muss eine Athena Tabelle mit speziellen Partitionierungsanweisungen erstellt werden.

Beispiel:

    CREATE EXTERNAL TABLE business_events
    (
        `eventid` string,
        `userid` string,
        `somedata` boolean,
        `someotherdata` float
    )

    PARTITIONED BY (year string, month string, day string)

    ROW FORMAT SERDE 'org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe'
    STORED AS INPUTFORMAT 'org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat'
    OUTPUTFORMAT 'org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat'
    LOCATION 's3://my-data-warehouse/business-events';

Wie man sieht, werden diese drei speziellen Felder nur in der `PARTITIONED BY` Klausel aufgeführt, nicht aber in der eigentlichen Feldliste der Tabelle. Dennoch stehen sie danach in SQL Abfragen genauso zur Verfügung wie die "normalen" Felder.


## Partitionierung bei der Datenablage (Firehose-Sicht)

Damit in einem Setup, bei dem die Daten über Amazon Data Firehose kontinuierlich nach S3 gestreamt werden, die Datensätze logisch korrekt partitioniert werden, müssen einige Maßnahmen ergriffen werden.

An dieser Stelle ein kurzer Einschub:

Ohne weiteres Zutun legt Data Firehose die Parquet-Dateien ebenfalls in einer nach Zeit segmentierten Unterordnerstruktur ab, ungefähr so:

    datawarehouse/
        business-events/
            2024/
                09/
                    02/
                        00/
                            file1.parquet
                            file2.parquet
                        01/
                            file3.parquet
                            file4.parquet

Wie man sieht, handelt es sich um eine vierstufige Hierarchie mit den Segmenten Jahr/Monat/Tag/Stunde.

Aber Vorsicht: Hierbei handelt es sich in keinster Weise um eine logische bzw. inhaltliche Partitionierung! Ganz im Gegenteil ist dies eine rein technische Unterteilung — Data Firehose puffert einfließende Datensätze für einen (konfigurierbaren) Zeitraum, und die Verzeichnisstruktur in der eine Parquet-Datei schließlich landet basiert ausschließlich auf dem Zeitstempel des Moments, in dem Data Firehose die Speicherung in S3 vornimmt.

Der Inhalt der zu schreibenden Datensätze wird dabei in keiner Weise berücksichtigt.

Der Datensatz eines Ereignisses, das in einer Anwendungsplattform am 1. September aufgetreten ist, kann somit auch in der S3 Ordnerstruktur vom 2. September abgelegt werden, falls aus irgendwelchen Gründen eine längere Verzögerung zwischen Eintritt des Ereignisses und dessen Data Warehouse Verarbeitung liegt.

Genau das müssen wir mit einer Partitionierung nach logischen, also inhaltlichen, Gesichtspunkten vermeiden. Dazu ist es notwendig, dass Data Firehose in jeden angelieferten Datensatz "hineinschaut", dessen Struktur versteht, und die Inhalte in der Struktur interpretiert.

Dies ist möglich über das Feature "Dynamic partitioning" in Kombination mit "Inline parsing for JSON".

Dies erlaubt es dem Firehose Stream, während der Verarbeitung auf die einzelnen JSON Felder eines Event-Datensatzes zuzugreifen, die Werte der relevanten Felder zu extrahieren, und diese Feld-Werte dann beim Zusammensetzen des S3 Ordner-Pfades wieder zu verwenden.

Wir gehen im Folgenden von dieser JSON Struktur bei Datenanlieferung in Data Firehose aus:

```json
{
    "eventid": "9148766a-dc1e-473f-a198-11b5191f4cb0",
    "userid": "01615373-bb20-480e-921b-b7610bacc828",
    "somedata": true,
    "someotherdata": 1.94387,
    "year": "2024",
    "month": "09",
    "day": "01"
}
```

### Schritt für Schritt: Glue & Data Firehose konfigurieren

Das Vorgehen ist nun wie folgt:

- Als erstes muss eine neue AWS Glue Tabelle angelegt werden, in der das Schema der angelieferten Daten spezifiziert wird.
- Der Firehose Stream benötigt dieses Schema, um die von der Anwendung angelieferten JSON Datensätze korrekt interpretieren zu können.
- Der Name der Tabelle lautet "business_events_as_json", sie gehört zur Glue Database "business_events".
- Das Table Format ist "Standard AWS Glue table".
- Das Data Format ist "JSON"

Für das Glue Schema müssen nun alle Felder des angelieferten JSON, inklusive der drei Datumsfelder `year`, `month`, und `day`, definiert werden. Dies geschieht am einfachsten per JSON:

```json
[
    {
        "Name": "eventid",
        "Type": "string",
        "Comment": "",
        "Parameters": {}
    },
    {
        "Name": "userid",
        "Type": "string",
        "Comment": "",
        "Parameters": {}
    },
    {
        "Name": "somedata",
        "Type": "boolean",
        "Comment": "",
        "Parameters": {}
    },
    {
        "Name": "someotherdata",
        "Type": "double",
        "Comment": "",
        "Parameters": {}
    },
    {
        "Name": "year",
        "Type": "string",
        "Comment": "",
        "Parameters": {}
    },
    {
        "Name": "month",
        "Type": "string",
        "Comment": "",
        "Parameters": {}
    },
    {
        "Name": "day",
        "Type": "string",
        "Comment": "",
        "Parameters": {}
    }
]
```

Man beachte, dass AWS Glue auch hier bereits die Definition von Partitions-Feldern erlaubt — entgegen der Intuition ist das an dieser Stelle aber irrelevant, weshalb die drei Datumsfelder auch nicht weiter als solche deklariert werden. Die Partitionierung geschieht erst im Folgenden durch Mechanismen, die in der Konfiguration des Firehose Streams definiert werden.

Nun kann ein neuer *Firehose Stream* angelegt werden, der die JSON Daten unter Berücksichtigung der Partitionierungsinformationen als Parquet-Dateien in der Zielstruktur auf S3 ablegt:

- Die Source lautet (zumindest im Fall von JOBOO) "Direct PUT", so dass der Stream einen HTTP Endpunkt anbietet, über den JSON Datensätze von außen angeliefert werden können.
- Die Destination ist "Amazon S3".
- Als Name vergeben wir `business-events`.
- Wir aktivieren "Enable record format conversion", und wählen "Apache Parquet" als Output Format.
- Als "Schema for source records" definieren wir nun die zuvor angelegte Glue Table, durch Angabe der korrekten Glue Region, Database, und Table `business_events_as_json`.
- Bei den Destination Settings geben wir den gewünschten S3 Bucket als Ziel-Bucket an (im obigen Beispiel `my-data-warehouse`, und aktivieren "Dynamic Partitioning".
- Nun kommt der spannende Teil: Wir aktivieren "Inline Parsing for JSON", und geben bei "Dynamic Partitioning Keys" drei Einträge an:
  - Key name: `year`, JQ expression: `.year`
  - Key name: `month`, JQ expression: `.month`
  - Key name: `day`, JQ expression: `.day`
- Dies extrahiert mittels der nativen JQ-Unterstützung von Data Firehose die Werte der drei relevanten Datumsfelder aus dem JSON, und macht sie unter den Key Names verfügbar.
- Diese Key Names kommen nun im Feld "S3 Bucket Prefix" wieder zum Tragen, denn dort geben wir an:

```
business-events/
    year=!{partitionKeyFromQuery:year}/
    month=!{partitionKeyFromQuery:month}/
    day=!{partitionKeyFromQuery:day}/
```

(Wichtig: diese Bucket Prefix Angabe erfolgt in der Konfiguration ohne Leerzeichen und auf einer einzelnen Zeile; hier wurde lediglich zur besseren Lesbarkeit der Text umgebrochen).

Genau dies sorgt dafür, dass die Parquet-Dateien in der gewünschten Ordnerstruktur abgelegt werden — basierend auf den Werten für `year`, `month`, und `day` innerhalb jedes einzelnen JSON Event Objekts, und unabhängig vom Verarbeitungszeitpunkt.

Ob man tatsächlich die richtigen JSON Felder für die Extraktion der relevanten Datumsfelder "erwischt", kann man einfach lokal an einer Konsole nachvollziehen, sofern auf dem eigenen System [jq](https://jqlang.github.io/jq/) installiert ist:

```bash
echo '{
        "eventid": "9148766a-dc1e-473f-a198-11b5191f4cb0",
        "userid": "01615373-bb20-480e-921b-b7610bacc828",
        "somedata": true,
        "someotherdata": 1.94387,
        "year": "2024",
        "month": "09",
        "day": "01"
      }' | jq ".year"
```

Nun können Events an diesen Stream per HTTP eingeliefert werden, und diese müssen dann nach entsprechender Verzögerung (dem Buffer Interval) in den korrekten Unterordnern in S3 in Form von Parquet-Dateien auftauchen.

Um diese Daten strukturiert abzufragen, kann nun in Athena mittels des weiter oben aufgeführten `CREATE EXTERNAL TABLE business_events...` Statements die Tabelle mit Partitions-Unterstützung angelegt werden.

Achtung: Queries auf diese Tabelle werden ohne Weiteres nur leere Resultsets liefern; damit Athena die Daten in der Partitionsstruktur auch tatsächlich "sieht", müssen die Metadaten der Tabelle aktualisiert werden — dies geschieht mit dem Statement `MSCK REPAIR TABLE business_events`.

Dabei ist zu beachten, dass dies regelmäßig ausgeführt werden muss, nämlich immer dann, wenn ein neuer Partitionsordner entsteht — in unserem Beispiel also zum Start jeden Tages.
