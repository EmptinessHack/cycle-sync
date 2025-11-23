import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

// Función para verificar y mostrar errores de configuración
function checkConfiguration() {
  const issues: string[] = [];
  
  // Verificar variables de entorno importantes
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;
  if (!privyAppId || privyAppId.trim() === '') {
    console.warn('⚠️ VITE_PRIVY_APP_ID no está configurado. La app funcionará en modo demo.');
  }
  
  // Verificar que el elemento root existe
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    issues.push('No se encontró el elemento con id="root" en el HTML');
  }
  
  if (issues.length > 0) {
    console.error('❌ Problemas de configuración detectados:', issues);
    return false;
  }
  
  return true;
}

// Registrar service worker para PWA (no crítico si falla)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker registrado:', registration);
      })
      .catch(registrationError => {
        console.warn('⚠️ Service Worker no pudo registrarse (no crítico):', registrationError);
      });
  });
}

// Verificar configuración antes de renderizar
if (!checkConfiguration()) {
  console.error('❌ La aplicación no puede iniciarse debido a problemas de configuración.');
}

// Obtener el elemento root
const rootElement = document.getElementById("root");

if (!rootElement) {
  // Si no existe el elemento root, mostrar un error visible
  document.body.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f5f5f5;
    ">
      <div style="
        max-width: 600px;
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      ">
        <h1 style="color: #dc2626; margin-bottom: 1rem;">❌ Error de Configuración</h1>
        <p style="color: #666; margin-bottom: 1rem;">
          No se encontró el elemento con id="root" en el HTML.
        </p>
        <p style="color: #666; font-size: 0.875rem;">
          Por favor, verifica que el archivo index.html contiene: 
          <code style="background: #f0f0f0; padding: 0.25rem 0.5rem; border-radius: 4px;">
            &lt;div id="root"&gt;&lt;/div&gt;
          </code>
        </p>
      </div>
    </div>
  `;
  throw new Error('Elemento root no encontrado en el DOM');
}

// Renderizar la aplicación con Error Boundary
try {
  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log('✅ Aplicación renderizada correctamente');
} catch (error) {
  console.error('❌ Error al renderizar la aplicación:', error);
  
  // Mostrar error en la página
  rootElement.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f5f5f5;
    ">
      <div style="
        max-width: 600px;
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      ">
        <h1 style="color: #dc2626; margin-bottom: 1rem;">❌ Error al Iniciar</h1>
        <p style="color: #666; margin-bottom: 1rem;">
          No se pudo iniciar la aplicación. Por favor, verifica la consola del navegador para más detalles.
        </p>
        <pre style="
          background: #f0f0f0;
          padding: 1rem;
          border-radius: 4px;
          overflow: auto;
          font-size: 0.875rem;
          color: #dc2626;
        ">${error instanceof Error ? error.message : String(error)}</pre>
        <button
          onclick="window.location.reload()"
          style="
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: #16697A;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
          "
        >
          Recargar página
        </button>
      </div>
    </div>
  `;
}
