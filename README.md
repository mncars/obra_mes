## Requerimientos

* [Node 0.10 o superior](http://nodejs.org)
* [Ruby 2.1.0](https://www.ruby-lang.org/)
* [Gulp 3.5 o superior](http://gulpjs.com)

### Preparación del entorno

* Instalar Node
* Instalar Ruby (recomendado con `rvm`)
* Instalar Gulp

```sh
$ npm install --global gulp
```

* Instalar Bower

```sh
$ npm install --global bower
```

* Instalar las dependencias de node, ruby y bower

```sh
$ bundle install
$ npm install
$ gulp bower
```

## Estructura de directorios
Las carpetas claves del proyecto son:

```
|- .tmp                Carpeta temporal donde se copian ficheros compilados
|- .jekyll             Carpeta temporal donde se copian los ficheros compilados con jekyll
|- node_modules        Ubicación de los componentes de node descargados
|- bower_components    Ubicación de los componentes de bower descargados
|- src
  |- _doc_assets       Ficheros base de la documentación con hologram
  |- _includes         Ficheros a incluir en las páginas
  |- _layouts          Layouts del site
  |- _sass             Fuentes de hoja de estilos
  |- vendor            Ficheros para producción de los componentes de Bower
|- bower.json          Dependencias de bower
|- package.json        Dependencias de node.js
|- Gemfile             Dependencias de ruby
```

## Tareas de Gulp

### Tareas principales

```sh
$ gulp
```

Compila SASS y Jekyll. Lanza un servidor web con el site y se queda a la escucha de cambios para volver a compilar y recargar el navegador.

```sh
$ gulp build
```

Compila el site para producción y lo deja en la carpeta `dist`

```sh
$ gulp serve:dist
```

Compila el site para producción y lo lanza en un servidor web

```sh
$ gulp bower
```

Actualiza las dependencias de bower del proyecto y copia a la carpeta `vendor` los ficheros para producción.

### Tareas secundarias

```sh
$ gulp sass
```

Compila los estilos SASS

```sh
$ gulp jekyll
```

Compila el site de plantillas en Jekyll


```sh
$ gulp watch
```

Espía cambios en los ficheros para lanzar tareas secundarias

## Cómo instalar un nuevo paquete con bower

1. Instala el componente deseado mediante `bower install <nombre> -S`
2. Verifica el fichero `bower.json` del componente instalado para comprobar que los ficheros definidos en el aparatado `main` son los deseados para tu proyecto. Si no lo fuera, añade una sección en el apartado de `overrides` en nuestro `bower.json` para especificar cuales quieres.
3. Ejecuta `gulp bower` para actualizar las referencias y el contenido de la carpeta `src\vendor`