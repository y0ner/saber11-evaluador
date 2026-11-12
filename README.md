<div align="center">

![Saber 11 Banner](https://capsule-render.vercel.app/api?type=waving&color=1e293b&height=250&section=header&text=Saber%2011&fontSize=80&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Evaluador%20y%20registro%20de%20respuestas%20ICFES&descAlignY=55&descSize=20)

[![Estado del Proyecto](https://img.shields.io/badge/Estado-Activo-success?style=for-the-badge)](https://github.com/y0ner/saber11-evaluador)
[![Mantenimiento](https://img.shields.io/badge/Mantenimiento-Continuo-blue?style=for-the-badge)](https://github.com/y0ner/saber11-evaluador)
[![Stack](https://img.shields.io/badge/Stack-HTML%20%C2%B7%20CSS%20%C2%B7%20JavaScript-orange?style=for-the-badge)](https://github.com/y0ner/saber11-evaluador)

</div>

Una aplicación web moderna, interactiva y rápida para practicar con cuadernillos del **ICFES Saber 11** (Lectura Crítica, Matemáticas, Ciencias Naturales, Sociales e Inglés). 

Permite registrar tus respuestas pregunta por pregunta y compararlas en tiempo real con la **Tabla de Respuestas Correctas oficial** extraída automáticamente de la última página de cada cuadernillo en PDF.

![Preview App](vlogo.png)

---

## 🌟 Características Principales

- **📚 Todos los Cuadernillos Oficiales Saber 11:**
  - **Lectura Crítica (2026)**: 49 preguntas
  - **Matemáticas (2026)**: 50 preguntas
  - **Ciencias Naturales (2026)**: 50 preguntas
  - **Sociales y Ciudadanas**: 48 preguntas
  - **Inglés (2024)**: 25 preguntas
- **📱 Modo Dual de Respuesta:**
  - **Hoja OMR (Grid)**: Vista global tipo hoja de respuestas para marcar A, B, C, D de un vistazo.
  - **Modo Enfoque (Paso a Paso)**: Respuesta individual con atajos de teclado (`1`, `2`, `3`, `4` o `A`, `B`, `C`, `D` y flechas direccionales).
- **⏱️ Cronómetro Integrado:** Mide el tiempo invertido en cada prueba para mejorar tu velocidad.
- **📊 Calificación Automática y Desglose Detallado:**
  - Porcentaje global y nivel de desempeño.
  - Tabla comparativa por pregunta (*Tu respuesta* vs *Solucionario PDF* vs *Afirmación / Competencia evaluada*).
  - Filtros para ver rápidamente preguntas incorrectas o sin responder.
- **💾 Guardado Automático:** Mantiene tus respuestas mediante `localStorage` para no perder el progreso si recargas la página.

---

## 🚀 Cómo Usarlo

1. **Localmente (Directo):**
   Clona el repositorio y abre `index.html` en tu navegador favorito:
   ```bash
   git clone https://github.com/y0ner/saber11-evaluador.git
   cd saber11-evaluador
   ```
   Simplemente haz doble clic en `index.html` o abre un servidor local:
   ```bash
   python3 -m http.server 8080
   ```
   Abre [http://localhost:8080](http://localhost:8080) en tu navegador.

---

## 🛠️ Tecnologías

- **HTML5 & CSS3 Vanilla** (Diseño Dark Mode moderno, responsive y accesible).
- **JavaScript (ES6+)** sin dependencias externas pesadas.
- **Python / pdftotext** para la extracción e ingesta de solucionarios desde PDFs oficiales.

---

<div align="center">
  <i>Desarrollado y mantenido con estándares de calidad técnica por <a href="https://github.com/y0ner">y0ner</a></i>
</div>
