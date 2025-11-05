# Travel website clone

## Enviroment

    npm install

    npm run build

    npm start

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/tin-gprietos-projects/v0-travel-website-clone)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/fNGYdz2woOt)

## IA Support

Para la implementacion de un chatbot con IA, utilizamos una libreria open-source de Next.js llamada AI SDK (https://ai-sdk.dev/) que permite optar por multiples proveedores de IA como openIA, google, ollama, deepseek, etc.

### Instalacion

### Windows 

- Descargar Ollama (https://ollama.com/download)

### Linux

    curl -fsSL https://ollama.com/install.sh | sh 

### Setup

Se opto por el modelo preentrenado y ligero (qwen2.5:0.5b) que brinda un fluido funcionamiento corriendo en local.
(https://ollama.com/library/qwen2.5:0.5b)

- Correr modelo - tanto en bash como powershell

    > ollama run qwen2.5:0.5b

### Mejoras

Debido a que es un modelo que corre localmente tiene muchas limitaciones debido a la restriccion por hardware. Una alternativa para esto es utilizar a Google como proveedor y utilizar la API de gemini.

https://ai-sdk.dev/providers/community-providers/gemini-cli

    npm install ai-sdk-provider-gemini-cli ai

Codigo a implementar 

    import { createGeminiProvider } from 'ai-sdk-provider-gemini-cli';
    
    // OAuth authentication (recommended)
    const gemini = createGeminiProvider({
    authType: 'oauth-personal',
    });
    
    // API key authentication
    const gemini = createGeminiProvider({
    authType: 'api-key',
    apiKey: process.env.GEMINI_API_KEY,
    });

    // Declaracion del modelo
    const model = gemini('gemini-2.5-pro');

Gestion de la API key (https://aistudio.google.com/api-keys)

Asi mismo, el modelo deberia reentrenarse exclusivamente con informacion de la aplicacion para que pueda dar respuestas adecuadas a informacion confiable (a determiinar).


## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/tin-gprietos-projects/v0-travel-website-clone](https://vercel.com/tin-gprietos-projects/v0-travel-website-clone)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/fNGYdz2woOt](https://v0.app/chat/projects/fNGYdz2woOt)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository