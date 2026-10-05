import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const RAIZ = ".";
const THUMBS = "thumbs";

// true = volver a crear todas las miniaturas aunque ya existan
const REGENERAR_TODAS = true;

// Tamaño de la ventana de captura
const VIEWPORT_WIDTH = 1400;
const VIEWPORT_HEIGHT = 1000;

// Área de recorte para evitar paneles laterales
const CLIP_X = 270;
const CLIP_Y = 90;
const CLIP_WIDTH = 840;
const CLIP_HEIGHT = 760;

if (!fs.existsSync(THUMBS)) {
    fs.mkdirSync(THUMBS, {
        recursive: true
    });
}

const archivos = fs
    .readdirSync(RAIZ)
    .filter(nombre =>
        nombre.toLowerCase().endsWith(".html")
    );

console.log(
    `Se encontraron ${archivos.length} archivos HTML.`
);

const browser = await chromium.launch({
    headless: true
});

const page = await browser.newPage({
    viewport: {
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT
    },
    deviceScaleFactor: 1
});

for (const archivo of archivos) {

    const nombreBase =
        path.basename(
            archivo,
            path.extname(archivo)
        );

    const miniatura =
        path.join(
            THUMBS,
            `${nombreBase}.png`
        );

    if (fs.existsSync(miniatura) && !REGENERAR_TODAS) {

        console.log(
            `Ya existe: ${miniatura}`
        );

        continue;
    }

    const url =
        `http://127.0.0.1:8000/${encodeURIComponent(archivo)}`;

    console.log(
        `Procesando: ${archivo}`
    );

    try {

        await page.goto(
            url,
            {
                waitUntil: "domcontentloaded",
                timeout: 60000
            }
        );

        // Esperar a que cargue bien el visor y el modelo 3D
        await page.waitForTimeout(8000);

        // Colocar el mouse fuera de zonas activas
        await page.mouse.move(
            VIEWPORT_WIDTH / 2,
            VIEWPORT_HEIGHT - 40
        );

        await page.screenshot({
            path: miniatura,
            type: "png",
            clip: {
                x: CLIP_X,
                y: CLIP_Y,
                width: CLIP_WIDTH,
                height: CLIP_HEIGHT
            }
        });

        console.log(
            `Miniatura creada: ${miniatura}`
        );

    } catch (error) {

        console.error(
            `Error procesando ${archivo}:`,
            error.message
        );

    }
}

await browser.close();

console.log(
    "Proceso de miniaturas terminado."
);
