# Guía de Despliegue en Vercel

Esta guía te ayudará a asegurar que todos los cambios se reflejen correctamente en tu despliegue de Vercel.

## 🔄 Problema: Los cambios no se visualizan

Si los cambios no se visualizan en producción, sigue estos pasos:

### 1. Verificar que los cambios estén en Git

```bash
# Verificar el estado de Git
git status

# Si hay cambios sin commitear, haz commit y push
git add .
git commit -m "Actualizar integración OAuth con Google y Telegram"
git push origin main
```

### 2. Forzar un nuevo build en Vercel

1. **Ve a tu dashboard de Vercel**
   - Accede a [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Selecciona tu proyecto `cycle-sync-poze`

2. **Forzar un nuevo deployment**
   - Ve a la pestaña **"Deployments"**
   - Haz clic en los **tres puntos** (⋯) del último deployment
   - Selecciona **"Redeploy"**
   - O simplemente haz un nuevo push a tu repositorio

3. **Limpiar caché (si es necesario)**
   - En el dashboard de Vercel, ve a **Settings** > **General**
   - Busca la sección **"Build & Development Settings"**
   - Si hay opción de limpiar caché, úsala

### 3. Verificar Variables de Entorno en Vercel

1. **Ve a Settings > Environment Variables**
2. **Verifica que estas variables estén configuradas:**
   ```
   VITE_PRIVY_APP_ID=tu-privy-app-id-aqui
   ```
3. **Asegúrate de que estén disponibles para:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **Si falta alguna variable:**
   - Haz clic en **"Add New"**
   - Ingresa el nombre y valor
   - Selecciona los ambientes donde debe estar disponible
   - Guarda y haz un nuevo deployment

### 4. Configurar Redirect URIs en Privy Dashboard

**IMPORTANTE**: Para que OAuth funcione en producción, debes configurar el Redirect URI en Privy Dashboard.

1. **Ve a Privy Dashboard**
   - Accede a [https://dashboard.privy.io](https://dashboard.privy.io)
   - Selecciona tu aplicación

2. **Configura Redirect URIs**
   - Ve a **Settings** > **OAuth** > **Redirect URIs**
   - Agrega tu dominio de Vercel:
     ```
     https://cycle-sync-poze.vercel.app
     ```
   - **Importante**: No agregues barra final (`/`)
   - Guarda los cambios

3. **Si usas Google OAuth, también configura en Google Cloud Console**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - **APIs & Services** > **Credentials**
   - Edita tu OAuth 2.0 Client ID
   - En **Authorized redirect URIs**, agrega:
     ```
     https://auth.privy.io/api/v1/oauth/google/callback
     ```
   - Guarda los cambios

### 5. Limpiar Caché del Navegador

A veces el navegador tiene archivos en caché. Para ver los cambios:

1. **Hard Refresh**
   - **Windows/Linux**: `Ctrl + Shift + R` o `Ctrl + F5`
   - **Mac**: `Cmd + Shift + R`

2. **Limpiar caché del navegador**
   - Abre las herramientas de desarrollador (F12)
   - Click derecho en el botón de recargar
   - Selecciona **"Empty Cache and Hard Reload"**

3. **Modo incógnito**
   - Abre la aplicación en una ventana de incógnito
   - Esto te mostrará la versión sin caché

### 6. Verificar el Build

1. **Revisa los logs del build en Vercel**
   - Ve a **Deployments** > Selecciona el último deployment
   - Revisa los logs para ver si hay errores

2. **Verifica que el build sea exitoso**
   - El build debe completarse sin errores
   - Si hay errores, revísalos y corrígelos

## 📋 Checklist de Verificación

Antes de reportar que los cambios no se visualizan, verifica:

- [ ] Los cambios están commiteados y pusheados a Git
- [ ] Vercel ha detectado el nuevo commit y ha hecho un nuevo build
- [ ] El build en Vercel fue exitoso (sin errores)
- [ ] Las variables de entorno están configuradas en Vercel
- [ ] El Redirect URI `https://cycle-sync-poze.vercel.app` está en Privy Dashboard
- [ ] Has hecho un hard refresh en el navegador (Ctrl+Shift+R)
- [ ] Has probado en modo incógnito

## 🔍 Verificar que los cambios estén en producción

### Método 1: Verificar en el código fuente

1. Abre tu aplicación en Vercel: https://cycle-sync-poze.vercel.app
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña **"Sources"** o **"Network"**
4. Busca los archivos JavaScript compilados
5. Busca texto específico de tus cambios (ej: "Intentando login con Google...")

### Método 2: Verificar la versión del build

1. En Vercel, ve a **Deployments**
2. Verifica la fecha/hora del último deployment
3. Debe ser reciente (después de tus cambios)

### Método 3: Agregar un console.log temporal

Agrega un console.log único en tu código:

```typescript
console.log('🔵 Versión del build:', new Date().toISOString());
```

Luego verifica en la consola del navegador si aparece este log.

## 🐛 Solución de Problemas Comunes

### El build falla en Vercel

**Solución:**
- Revisa los logs del build en Vercel
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que el comando de build sea correcto: `npm run build`

### Las variables de entorno no funcionan

**Solución:**
- Verifica que las variables empiecen con `VITE_` (para Vite)
- Asegúrate de que estén configuradas para el ambiente correcto
- Después de agregar variables, haz un nuevo deployment

### Los cambios se ven en local pero no en producción

**Solución:**
1. Verifica que hayas hecho commit y push
2. Verifica que Vercel haya detectado el nuevo commit
3. Haz un hard refresh en el navegador
4. Limpia el caché del navegador

### OAuth no funciona en producción

**Solución:**
1. Verifica que el Redirect URI esté configurado en Privy Dashboard
2. Verifica que las variables de entorno estén configuradas en Vercel
3. Verifica que Google OAuth esté habilitado en Privy Dashboard
4. Revisa la consola del navegador para ver errores específicos

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Privy Dashboard](https://dashboard.privy.io)

## 💡 Tips

1. **Siempre verifica los logs del build** antes de reportar problemas
2. **Usa el modo incógnito** para verificar cambios sin caché
3. **Mantén las variables de entorno actualizadas** en Vercel
4. **Configura los Redirect URIs** antes de probar OAuth en producción

