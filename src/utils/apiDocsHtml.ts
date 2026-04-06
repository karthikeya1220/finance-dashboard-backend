/**
 * API Documentation HTML template
 * Serves OpenAPI spec documentation using ReDoc (simpler than Swagger UI)
 */

export const getApiDocsHtml = (specUrl: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Finance Dashboard API Documentation</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Montserrat', sans-serif;
    }
  </style>
</head>
<body>
  <redoc spec-url='${specUrl}'></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
</body>
</html>
  `;
};

export const getSwaggerSpecHtml = (specUrl: string): string => {
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>Finance Dashboard API - Swagger UI</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css">
    <style>
      html {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }
      *, *:before, *:after {
        box-sizing: inherit;
      }
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function() {
        const ui = SwaggerUIBundle({
          url: "${specUrl}",
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          layout: "BaseLayout",
          deepLinking: true,
          preloadContent: false,
          onComplete: function() {
            console.log("Swagger UI loaded successfully");
          }
        });
        window.ui = ui;
      };
    </script>
  </body>
</html>
  `;
};
