---
date: 2015-03-01T16:13:00+01:00
lastmod: 2015-03-01T16:13:00+01:00
title: "Transformieren und Validieren von JSON Requests in Play2"
description: "In diesem Tutorial möchte ich auf die Verarbeitung des JSON Body eines eingehenden POST Requests innerhalb eines Play2 Controllers eingehen, insbesondere in Hinblick auf die fachliche Validierung der JSON Struktur und ihrer Überführung in Models in der Applikation."
authors: ["manuelkiessling"]
slug: 2015/03/01/transformieren-und-validieren-von-json-requests-in-play2
lang: de
---

<p><em>Dies ist ein Crosspost vom <a href="https://galeria-kaufhof.github.io/tutorials/2015/03/01/transformieren-und-validieren-von-json-requests-in-play2/">Galeria Kaufhof Technology Blog</a></em>.</p>

<p>Als Anfänger in der Arbeit mit Scala stehe ich aktuell vor der Aufgabe, eine einfache Webservice API in Play2 zu
realisieren.</p>

<p>Der Webservice hat einen Endpunkt <code class="inline">/api/experiments</code>, über den via POST ein A/B Test (bzw. <em>Experiment</em>) mit 2 oder mehr
Varianten angelegt werden kann.</p>

<p>Der Body eines solchen Requests ist eine JSON Struktur, die den A/B Test beschreibt:</p>

<pre><code>{
  "name": "Checkout page buttons",
  "scope": 100.0,
  "variations": [
    {
      "name": "Group A",
      "weight": 70.0
    },
    {
      "name": "Group B",
      "weight": 30.0
    }
  ]
}
</code></pre>

<p>Mit dieser Struktur wird ein A/B Test erzeugt, der zwei Gruppen kennt (<em>A</em> und <em>B</em>), wobei in Gruppe A 70% der Benutzer
wandern, in Gruppe B 30%.</p>

<p>Auf die fachlichen Aspekte des Systems möchte ich aber gar nicht weiter eingehen. Wer interessiert ist tiefer
einzusteigen findet unter <a href="https://github.com/meinauto/freeab-server">https://github.com/meinauto/freeab-server</a> eine
Node.js Implementation, die ich unter
<a href="https://github.com/manuelkiessling/freeab-server-scala">https://github.com/manuelkiessling/freeab-server-scala</a> derzeit
nach Scala überführe.</p>

<p>An dieser Stelle möchte ich lediglich auf die Verarbeitung des JSON Body eines eingehenden POST Requests innerhalb des
Play2 Controllers eingehen, insbesondere in Hinblick auf die fachliche Validierung der JSON Struktur und ihrer
Überführung in Models in der Applikation.</p>

<p>Aktuell kennt die Applikation zwei fachliche Entitäten: <code class="inline">Experiment</code> und <code class="inline">Variation</code>, wobei ein <code class="inline">Experiment</code>
eine Liste von mindestens zwei oder mehr <code class="inline">Variation</code> Entitäten beinhaltet.</p>

<p>Jede dieser Entitäten ist im Code repräsentiert in je zwei verschiedenen Models. Ein <code class="inline">FormExperiment</code> ist eine case
Klasse welche das Model eines von außen über den Request eingehenden, aber noch nicht persistierten <code class="inline">Experiment</code>
darstellt. Diesem Model fehlt im Gegensatz zum persistierten Model z.B. eine eindeutige ID:</p>

<pre><code>final case class FormExperiment(
  name: String,
  scope: Double,
  formVariations: List[FormVariation]
)
</code></pre>

<p>Ein <code class="inline">FormExperiment</code> wiederum beinhaltet eine Liste von <code class="inline">FormVariation</code> Objekten:</p>

<pre><code>final case class FormVariation(
  name: String,
  weight: Double
)
</code></pre>

<p>Ein <code class="inline">FormExperiment</code> mit einer Liste von <code class="inline">FormVariation</code> Objekten wird durch die Persistierung zu einem <code class="inline">Experiment</code> mit
einer Liste von <code class="inline">Variation</code> Objekten, und damit zu “richtigen” fachlichen Entitäten im Sinne der Businesslogik der
Anwendung. Auf die Details hierzu gehe ich jedoch nicht ein – im Folgenden zeige ich, wie aus dem JSON des eingehenden
Requests ein <code class="inline">FormExperiment</code> mit einer Liste von <code class="inline">FormVariation</code> Objekten wird, und wie sichergestellt wird dass dies
nur geschieht, wenn die JSON Struktur syntaktisch und fachlich korrekt ist.</p>

<p>“Fachlich korrekt” meint hier beispielsweise die Anforderung, dass die Summe aller <code class="inline">weight</code> Attribute der Variationen
immer genau 100 (Prozent) ergeben muss, oder dass innerhalb eines Experiments die Namen der Variationen eindeutig
(im Sinne von unique) sein müssen.</p>

<p>Aber eins nach dem anderen. Wie kann man den JSON Body innerhalb eines Scala Play2 Controllers überhaupt lesen? Play2
bringt eine sehr mächtige JSON Bibliothek mit. Diese verfügt über sogenannte <em>Reads</em>. Dies ist ein Trait welcher es
ermöglicht, JSON beispielsweise in case Klassen zu überführen. Für eine <code class="inline">FormVariation</code> sieht das beispielsweise so aus:</p>

<pre><code>import play.api.libs.json._
import play.api.libs.functional.syntax._

final case class FormVariation(
  name: String,
  weight: Double
)

implicit val formVariationReads: Reads[FormVariation] = (
  (JsPath \ "name").read[String] and
    (JsPath \ "weight").read[Double]
  )(FormVariation.apply _)
</code></pre>

<p>Wie man sieht muss man lediglich einen <code class="inline">Reads</code> definieren, der die einzelnen Komponenten der JSON Struktur auf die
richtigen Typen mappt und dann in die case Klasse transformiert. Wie dieser dann zum Einsatz kommt, sehen wir später.</p>

<p>Diese Reads können auch geschachtelt werden, so dass wir unsere Entitätenstruktur, bei der ein <code class="inline">FormExperiment</code> neben
direkten Attributen auch noch eine Liste von <code class="inline">FormVariation</code> Objekten beinhaltet, einfach abbilden können:</p>

<pre><code>import play.api.libs.json._
import play.api.libs.functional.syntax._

final case class FormVariation(
  name: String,
  weight: Double
)

implicit val formVariationReads: Reads[FormVariation] = (
  (JsPath \ "name").read[String] and
    (JsPath \ "weight").read[Double]
  )(FormVariation.apply _)

final case class FormExperiment(
  name: String,
  scope: Double,
  formVariations: List[FormVariation]
)

implicit val formExperimentReads: Reads[FormExperiment] = (
  (JsPath \ "name").read[String] and
    (JsPath \ "scope").read[Double] and
      (JsPath \ "variations").read[List[FormVariation]]
  )(FormExperiment.apply _)
</code></pre>

<p>Nun haben wir für alle Entitäten eine case Klasse definiert sowie jeweils einen <code class="inline">Reads</code>, der eine entsprechende JSON
Struktur in diese Entitäten überführen kann. Setzen wir das Ganze in Bewegung:</p>

<pre><code>package controllers

import play.api.mvc._
import play.api.libs.json._
import play.api.libs.functional.syntax._

object Experiments extends Controller {

  final case class FormVariation(
    name: String,
    weight: Double
  )

  implicit val formVariationReads: Reads[FormVariation] = (
    (JsPath \ "name").read[String] and
      (JsPath \ "weight").read[Double]
    )(FormVariation.apply _)

  final case class FormExperiment(
    name: String,
    scope: Double,
    formVariations: List[FormVariation]
  )

  implicit val formExperimentReads: Reads[FormExperiment] = (
    (JsPath \ "name").read[String] and
      (JsPath \ "scope").read[Double] and
        (JsPath \ "variations").read[List[FormVariation]]
    )(FormExperiment.apply _)

  def save = Action(BodyParsers.parse.json) { request =&gt;
    val formExperimentResult = request.body.validate(formExperimentReads)
    Ok("Got the JSON!")
  }
}
</code></pre>

<p>Dieser einfache Controller mit der Methode <code class="inline">save</code> nimmt den POST Request entgegen. Er validiert den Request Body, dies
sorgt automatisch auch für eine Transformation in die Zielklassen.</p>

<p>Die Operation kann gelingen oder fehlschlagen – die beiden Ergebnisarten kann man einfach mit einem <code class="inline">match</code> behandeln:</p>

<pre><code>package controllers

import play.api.mvc._
import play.api.libs.json._
import play.api.libs.functional.syntax._

object Experiments extends Controller {

  final case class FormVariation(
    name: String,
    weight: Double
  )

  implicit val formVariationReads: Reads[FormVariation] = (
    (JsPath \ "name").read[String] and
      (JsPath \ "weight").read[Double]
    )(FormVariation.apply _)

  final case class FormExperiment(
    name: String,
    scope: Double,
    formVariations: List[FormVariation]
  )

  implicit val formExperimentReads: Reads[FormExperiment] = (
    (JsPath \ "name").read[String] and
      (JsPath \ "scope").read[Double] and
        (JsPath \ "variations").read[List[FormVariation]]
    )(FormExperiment.apply _)

  def save = Action(BodyParsers.parse.json) { request =&gt;
    val formExperimentResult = request.body.validate(formExperimentReads)
    formExperimentResult match {
      case e: JsError =&gt; {
        BadRequest("Something went wrong!")
      }
      case s: JsSuccess[FormExperiment] =&gt; {
        val formExperiment = s.get
        Ok("Received the experiments with name " + formExperiment.name)
      }
    }
  }
}
</code></pre>

<p>Eine eigene fachliche Validierung kann nun sehr einfach hinzugefügt werden, indem man den zu prüfenden <code class="inline">reads</code> Schritt
mit einem <em>Filter</em> verknüpft. Ein Filter prüft das jeweilige transformierte Element auf Basis einer eigenen Funktion,
die <code class="inline">true</code> bei Erfolg und <code class="inline">false</code> bei einem Fehlschlag zurückliefern muss. Ein Fehlschlag erzeugt dann einen
<code class="inline">ValidationError</code>, der zum Abbruch der Transformation und zu einem <code class="inline">JsError</code> führt:</p>

<pre><code>package controllers

import play.api.data.validation.ValidationError
import play.api.mvc._
import play.api.libs.json._
import play.api.libs.functional.syntax._

object Experiments extends Controller {

  final case class FormVariation(
    name: String,
    weight: Double
  )

  implicit val formVariationReads: Reads[FormVariation] = (
    (JsPath \ "name").read[String] and
      (JsPath \ "weight").read[Double]
    )(FormVariation.apply _)

  final case class FormExperiment(
    name: String,
    scope: Double,
    formVariations: List[FormVariation]
  )

  implicit val formExperimentReads: Reads[FormExperiment] = (
    (JsPath \ "name").read[String] and
      (JsPath \ "scope").read[Double] and
        (JsPath \ "variations").read[List[FormVariation]]
          .filter(ValidationError("The sum of the variation weights must be 100.0"))(
            _.map(_.weight).sum == 100.0
          )
    )(FormExperiment.apply _)

  def save = Action(BodyParsers.parse.json) { request =&gt;
    val formExperimentResult = request.body.validate(formExperimentReads)
    formExperimentResult match {
      case e: JsError =&gt; {
        BadRequest("Something went wrong!")
      }
      case s: JsSuccess[FormExperiment] =&gt; {
        val formExperiment = s.get
        Ok("Received the experiments with name " + formExperiment.name)
      }
    }
  }
}
</code></pre>

<p>Hier ist die Prüfung sehr einfach und kann inline als anonyme Funktion deklariert werden. Bei komplexeren Prüfungen kann
man dies natürlich auch über eine zusätzliche Funktion lösen:</p>

<pre><code>package controllers

import play.api.data.validation.ValidationError
import play.api.mvc._
import play.api.libs.json._
import play.api.libs.functional.syntax._

object Experiments extends Controller {

  private def areVariationsNamesUnique_?(formVariations: List[FormVariation]): Boolean = {
    formVariations.map(_.name).distinct.size == formVariations.size
  }

  final case class FormVariation(
    name: String,
    weight: Double
  )

  implicit val formVariationReads: Reads[FormVariation] = (
    (JsPath \ "name").read[String] and
      (JsPath \ "weight").read[Double]
    )(FormVariation.apply _)

  final case class FormExperiment(
    name: String,
    scope: Double,
    formVariations: List[FormVariation]
  )

  implicit val formExperimentReads: Reads[FormExperiment] = (
    (JsPath \ "name").read[String] and
      (JsPath \ "scope").read[Double] and
        (JsPath \ "variations").read[List[FormVariation]]
          .filter(ValidationError("The sum of the variation weights must be 100.0"))(
            _.map(_.weight).sum == 100.0
          )
          .filter(ValidationError("Variations names must be unique"))(areVariationsNamesUnique_?)
    )(FormExperiment.apply _)

  def save = Action(BodyParsers.parse.json) { request =&gt;
    val formExperimentResult = request.body.validate(formExperimentReads)
    formExperimentResult match {
      case e: JsError =&gt; {
        BadRequest("Something went wrong!")
      }
      case s: JsSuccess[FormExperiment] =&gt; {
        val formExperiment = s.get
        Ok("Received the experiments with name " + formExperiment.name)
      }
    }
  }
}
</code></pre>

<p>Wie man hier weiterhin sieht, können mehrere Filteroperationen einfach aneinandergekettet werden. Das bei einem
Fehlschlag entstehende <code class="inline">JsError</code> Objekt enthält alle Validierungsfehler mit ihren Fehlertexten, die z.B. wie folgt zu
einer zusammenhängenden Fehlermeldung transformiert werden können:</p>

<pre><code>formExperimentResult match {
  case e: JsError =&gt; {
    BadRequest("The following validation errors occured: " +
               e.errors.flatMap(_._2.map(_.message)) mkString ". ")
  }
  // ...
}
</code></pre>
