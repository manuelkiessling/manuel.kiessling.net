<?php

$uri = $_ENV['REQUEST_URI'];

if ($_SERVER['HTTPS'] !== 'on') {
    header ('HTTP/1.1 301 Moved Permanently');
    header ('Location: https://manuel.kiessling.net' . $uri);
    die();
}

if (stristr($uri, '/index.html')) {
  $redirectUri = str_ireplace('/index.html', '/', $uri);
  header ("HTTP/1.1 301 Moved Permanently"); 
  header ("Location: http://manuel.kiessling.net".$redirectUri);
  die();
}
