import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const RAIZ = ".";
const THUMBS = "thumbs";

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
        width: 1200,
        height: 900
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

    // Si ya existe, no volver a crearla
    if (fs.existsSync(miniatura)) {

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

        // Dar tiempo a que cargue WebGL y el modelo 3D
        await page.waitForTimeout(7000);

        await page.screenshot({
            path: miniatura,
            type: "png",
            fullPage: false
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
