const fs = require('fs');
const path = require('path');

const screenHtmlPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\public\\quiz-screen.html';

const newScreenHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Главный Экран — Тайный Вечер</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Montserrat:wght@400;500;700;800;900&display=swap" rel="stylesheet">
  <script src="/socket.io/socket.io.js"></script>
  <script>
    if (typeof io === 'undefined') {
      document.write('<script src="https://cdn.socket.io/4.7.5/socket.io.min.js"><\\/script>');
    }
  </script>
  
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: radial-gradient(circle at center, #0f0b07 0%, #030202 100%);
      color: #f5f5f7;
      font-family: 'Montserrat', sans-serif;
    }

    /* Фоновый холст - звезды, золотая пыль, матричный Glagolitic дождь */
    #bg-matrix-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
      opacity: 0.6;
    }

    /* ================= ВЕЛИКОЛЕПНЫЕ ГОЛОГРАММЫ ================= */
    
    /* Голографическая крепость */
    .hologram-fortress {
      position: absolute;
      top: 15%;
      left: 50%;
      transform: translateX(-50%);
      width: 75%;
      height: 38%;
      background: url('крепость.png') no-repeat center bottom;
      background-size: contain;
      z-index: 2;
      opacity: 0.25;
      filter: drop-shadow(0 0 40px rgba(212, 175, 55, 0.45)) sepia(1) saturate(5) brightness(0.9);
      mix-blend-mode: screen;
      pointer-events: none;
      animation: fortressBreathing 8s infinite ease-in-out;
    }

    @keyframes fortressBreathing {
      0%, 100% { transform: translateX(-50%) translateY(0) scale(1); opacity: 0.22; }
      50% { transform: translateX(-50%) translateY(-8px) scale(1.015); opacity: 0.28; }
    }

    /* Голограмма Петра Великого */
    .hologram-peter {
      position: absolute;
      top: 10%;
      right: 4%;
      width: 330px;
      height: 420px;
      background: url('петр.png') no-repeat center;
      background-size: contain;
      z-index: 2;
      opacity: 0.18;
      filter: drop-shadow(0 0 25px rgba(255, 215, 0, 0.4)) sepia(1) saturate(1.8) brightness(0.9);
      mix-blend-mode: screen;
      pointer-events: none;
      transition: opacity 1.5s ease-in-out;
      animation: peterBreathing 9s infinite ease-in-out;
    }

    @keyframes peterBreathing {
      0%, 100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.15; }
      50% { transform: translateY(-10px) scale(1.025) rotate(0.5deg); opacity: 0.22; }
    }

    /* Волны Невы у самого низа экрана */
    .parallax-wave {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 200%;
      height: 180px;
      background: url('волны.png') repeat-x center bottom;
      background-size: 50% 100%;
      z-index: 10;
      mix-blend-mode: screen;
      pointer-events: none;
    }

    .wave-back {
      animation: waveMoveBack 36s linear infinite;
      filter: sepia(1) saturate(6) hue-rotate(330deg) brightness(0.2);
      bottom: 20px;
      opacity: 0.15;
    }

    .wave-front {
      animation: waveMoveFront 20s linear infinite;
      filter: sepia(1) saturate(8) hue-rotate(345deg) brightness(0.35);
      bottom: 0;
      opacity: 0.28;
    }

    @keyframes waveMoveBack {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    @keyframes waveMoveFront {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(0); }
    }

    /* Контейнер HUD */
    .screen-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 6;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 50px;
      box-shadow: inset 0 0 200px rgba(0,0,0,0.95);
    }

    /* Логотип по центру сверху */
    .stage-logo {
      height: 95px;
      margin-bottom: 20px;
      filter: drop-shadow(0 0 25px rgba(255, 215, 0, 0.75));
      z-index: 12;
      animation: logoFloat 6s infinite ease-in-out;
    }

    @keyframes logoFloat {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(0.8deg); }
    }

    /* ================= ФИРМЕННЫЙ КИБЕР-БАРОЧНЫЙ СВИТОК ================= */
    .parchment-scroll-container {
      width: 80%;
      max-width: 1150px;
      background: linear-gradient(135deg, rgba(20, 16, 11, 0.95) 0%, rgba(10, 8, 5, 0.97) 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 2px solid rgba(255, 215, 0, 0.6);
      border-radius: 16px;
      padding: 35px 50px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.95), 0 0 35px rgba(212, 175, 55, 0.3), inset 0 0 25px rgba(255,215,0,0.05);
      position: relative;
      margin-top: 15px;
      opacity: 0;
      transform: translateY(-40px) scale(0.96);
      transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1);
      display: none;
      z-index: 15;
    }

    .parchment-scroll-container.active {
      display: block;
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* Угловой светящийся декор */
    .scroll-corner {
      position: absolute;
      width: 45px;
      height: 45px;
      border: 2px solid #d4af37;
      pointer-events: none;
      filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.5));
    }
    .sc-tl { top: 12px; left: 12px; border-right: none; border-bottom: none; }
    .sc-tr { top: 12px; right: 12px; border-left: none; border-bottom: none; }
    .sc-bl { bottom: 12px; left: 12px; border-right: none; border-top: none; }
    .sc-br { bottom: 12px; right: 12px; border-left: none; border-top: none; }

    /* Бегущая световая полоса по рамке свитка */
    .parchment-scroll-container::after {
      content: '';
      position: absolute;
      top: -2px; left: -2px; right: -2px; bottom: -2px;
      border-radius: 16px;
      background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.6), transparent);
      z-index: -1;
      animation: frameLightSweep 4s linear infinite;
      background-size: 200% 100%;
    }

    @keyframes frameLightSweep {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Медальон с номером раунда */
    .round-num-tag {
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #ffd700 0%, #b38612 100%);
      border: 2px solid #ffd700;
      padding: 6px 36px;
      border-radius: 25px;
      font-family: 'Cinzel', serif;
      font-size: 15px;
      color: #0c0a07;
      font-weight: 900;
      box-shadow: 0 5px 12px rgba(0,0,0,0.6), 0 0 10px rgba(255, 215, 0, 0.4);
      letter-spacing: 1px;
    }

    .question-title {
      font-family: 'Playfair Display', serif;
      font-size: 34px;
      font-weight: 700;
      color: #ffd700;
      text-align: center;
      line-height: 1.4;
      margin-top: 15px;
      margin-bottom: 30px;
      text-shadow: 0 3px 6px rgba(0,0,0,0.9);
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .option-card {
      background: rgba(30, 24, 16, 0.75);
      border: 1.5px solid rgba(122, 98, 62, 0.4);
      border-radius: 10px;
      padding: 22px 26px;
      font-size: 21px;
      font-weight: 600;
      color: #ebdcb9;
      transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      position: relative;
      overflow: hidden;
    }

    .option-card.correct {
      background: rgba(0, 230, 118, 0.16) !important;
      border-color: #00e676 !important;
      color: #00e676 !important;
      box-shadow: 0 0 25px rgba(0, 230, 118, 0.5), inset 0 0 10px rgba(0, 230, 118, 0.1);
      transform: scale(1.03);
    }

    .option-card.correct::after {
      content: '';
      position: absolute;
      top: 0; left: -100%; width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 230, 118, 0.3), transparent);
      transform: skewX(-25deg);
      animation: correctSweep 1.5s infinite ease-out;
    }

    @keyframes correctSweep {
      0% { left: -100%; }
      100% { left: 200%; }
    }

    .option-card.incorrect {
      opacity: 0.2;
      transform: scale(0.96);
    }

    /* ================= АСТРОЛЯБИЯ / Spinning Clock Timer ================= */
    .timer-container {
      position: absolute;
      top: 30px;
      right: 50px;
      width: 120px;
      height: 120px;
      z-index: 20;
      display: none;
      align-items: center;
      justify-content: center;
    }

    .timer-container.active {
      display: flex;
    }

    .astrolabe-gears {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0.4;
    }

    .gear-main {
      position: absolute;
      top: 15px;
      left: 15px;
      width: 90px;
      height: 90px;
      stroke: #d4af37;
      stroke-width: 1.5;
      fill: none;
      animation: spinClockwise 15s linear infinite;
    }

    .gear-secondary {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 44px;
      height: 44px;
      stroke: #ffd700;
      stroke-width: 1.2;
      fill: none;
      animation: spinCounterClockwise 8s linear infinite;
    }

    .gear-third {
      position: absolute;
      bottom: 5px;
      left: 5px;
      width: 36px;
      height: 36px;
      stroke: #c49a2a;
      stroke-width: 1;
      fill: none;
      animation: spinClockwise 5s linear infinite;
    }

    @keyframes spinClockwise {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes spinCounterClockwise {
      from { transform: rotate(0deg); }
      to { transform: rotate(-360deg); }
    }

    .timer-svg {
      width: 120px;
      height: 120px;
      transform: rotate(-90deg);
    }

    .timer-bg-circle {
      fill: none;
      stroke: rgba(80, 61, 32, 0.45);
      stroke-width: 7;
    }

    .timer-progress-circle {
      fill: none;
      stroke: #ffd700;
      stroke-width: 7;
      stroke-dasharray: 345;
      stroke-dashoffset: 0;
      transition: stroke-dashoffset 0.1s linear;
      filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
    }

    .timer-text {
      position: absolute;
      font-family: 'Cinzel', serif;
      font-size: 38px;
      font-weight: 900;
      color: #ffd700;
      text-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
    }

    .timer-text.pulse-critical {
      color: #ef4444;
      animation: textStrobe 0.5s infinite alternate;
    }

    @keyframes textStrobe {
      from { transform: scale(1); text-shadow: 0 0 8px #ef4444; }
      to { transform: scale(1.2); text-shadow: 0 0 20px #ef4444; }
    }

    /* ================= СТЕНДБАИ СПЛЭШ ================= */
    .standby-splash {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-grow: 1;
      z-index: 10;
      margin-top: 60px;
    }

    .standby-splash h2 {
      font-family: 'Cinzel', serif;
      font-size: 72px;
      color: #ffd700;
      letter-spacing: 4px;
      text-shadow: 0 0 45px rgba(255, 215, 0, 0.65);
      margin-bottom: 15px;
      animation: textGlowPulse 4s infinite ease-in-out;
    }

    @keyframes textGlowPulse {
      0%, 100% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.4); }
      50% { text-shadow: 0 0 50px rgba(255, 215, 0, 0.85); }
    }

    /* ================= СТАБИЛЬНЫЙ ЛИДЕРБОРД "МОРСКАЯ ГАВАНЬ" ================= */
    .leaderboard-race-container {
      position: absolute;
      bottom: 55px;
      left: 6%;
      right: 6%;
      height: 48%;
      z-index: 5;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      pointer-events: none;
      opacity: 0;
      transform: translateY(60px);
      transition: all 1s cubic-bezier(0.19, 1, 0.22, 1);
    }

    .leaderboard-race-container.active {
      opacity: 1;
      transform: translateY(0);
    }

    .race-lane {
      width: 100%;
      height: 40px;
      position: relative;
      background: linear-gradient(90deg, rgba(212, 175, 55, 0) 0%, rgba(212, 175, 55, 0.05) 30%, rgba(212, 175, 55, 0.05) 70%, rgba(212, 175, 55, 0) 100%);
      border-bottom: 2px dashed rgba(212, 175, 55, 0.25);
      box-shadow: 0 1px 6px rgba(255, 215, 0, 0.05);
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .race-lane::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent 40%, rgba(255, 215, 0, 0.06) 50%, transparent 60%);
      background-size: 200px 100%;
      animation: laneWaveRipple 8s linear infinite;
    }

    @keyframes laneWaveRipple {
      0% { background-position: -200px 0; }
      100% { background-position: 200px 0; }
    }

    .lane-label {
      position: absolute;
      left: -48px;
      top: 50%;
      transform: translateY(-50%);
      font-family: 'Cinzel', serif;
      font-size: 14px;
      color: #ffd700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.9);
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    /* Фрегаты */
    .frigate-ship {
      position: absolute;
      left: 10%;
      bottom: -8px;
      width: 70px;
      height: 70px;
      transition: left 2.5s cubic-bezier(0.2, 0.8, 0.25, 1);
      filter: drop-shadow(0 6px 10px rgba(0,0,0,0.85));
      animation: shipFloatPhysics 4s infinite ease-in-out;
      transform-origin: bottom center;
    }

    @keyframes shipFloatPhysics {
      0%, 100% { transform: translateY(0) rotate(2.5deg); }
      50% { transform: translateY(-5px) rotate(-2.5deg); }
    }

    /* Вертикальный световой луч у корабля-лидера */
    .frigate-ship.leader::after {
      content: '';
      position: absolute;
      bottom: 25px;
      left: 50%;
      transform: translateX(-50%);
      width: 6px;
      height: 600px;
      background: linear-gradient(0deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 215, 0, 0.1) 60%, transparent 100%);
      filter: blur(2px);
      z-index: -1;
      animation: beamFlicker 2s infinite ease-in-out;
    }

    @keyframes beamFlicker {
      0%, 100% { opacity: 0.8; width: 6px; }
      50% { opacity: 0.4; width: 8px; }
    }

    .ship-3d-label {
      position: absolute;
      top: -18px;
      left: 50%;
      transform: translateX(-50%);
      font-family: 'Cinzel', serif;
      font-size: 10px;
      font-weight: 900;
      color: #ffd700;
      background: rgba(15, 12, 9, 0.95);
      border: 1px solid #d4af37;
      padding: 1px 6px;
      border-radius: 3px;
      white-space: nowrap;
      box-shadow: 0 2px 5px rgba(0,0,0,0.6);
    }

    /* Брызги под кораблем */
    .gulf-wake-particle {
      position: absolute;
      bottom: 2px;
      left: -12px;
      width: 6px;
      height: 6px;
      background: rgba(255, 215, 0, 0.7);
      border-radius: 50%;
      filter: blur(0.5px) drop-shadow(0 0 4px #ffd700);
      animation: wakeFlow 1.2s infinite ease-out;
    }

    @keyframes wakeFlow {
      0% { transform: scale(1) translateX(0) translateY(0); opacity: 0.8; }
      100% { transform: scale(0) translateX(-30px) translateY(-3px); opacity: 0; }
    }

    /* ================= НЕЙРО-СКАН (РАУНД 2: HIGHTECH) ================= */
    .laser-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 25;
      pointer-events: none;
      display: none;
      background: rgba(0, 230, 118, 0.03);
    }

    .laser-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 4px;
      background: #00e676;
      box-shadow: 0 0 20px #00e676, 0 0 40px #00e676;
      animation: laserSweep 4s infinite ease-in-out;
      opacity: 0.9;
    }

    @keyframes laserSweep {
      0%, 100% { top: 5%; }
      50% { top: 95%; }
    }

    .laser-reticle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 380px;
      height: 380px;
      border: 2px dashed rgba(0, 230, 118, 0.35);
      border-radius: 50%;
      animation: spinClockwise 20s linear infinite;
    }
    .laser-reticle::before {
      content: "";
      position: absolute;
      top: 20px; left: 20px; right: 20px; bottom: 20px;
      border: 1px solid rgba(0, 230, 118, 0.15);
      border-radius: 50%;
      border-left: 3px solid #00e676;
      border-right: 3px solid #00e676;
      animation: spinCounterClockwise 8s linear infinite;
    }

    .holographic-scan-card {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      width: 600px;
      background: rgba(4, 12, 8, 0.96);
      border: 3px solid #00e676;
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      color: #00e676;
      font-family: 'Cinzel', serif;
      z-index: 26;
      opacity: 0;
      box-shadow: 0 0 50px rgba(0, 230, 118, 0.55), inset 0 0 25px rgba(0, 230, 118, 0.2);
      transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
    }

    .holographic-scan-card.active {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }

    .match-percent-circle {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      border: 3px dashed #00e676;
      border-top-color: transparent;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 44px;
      font-weight: 900;
      margin: 25px auto;
      text-shadow: 0 0 15px rgba(0, 230, 118, 0.7);
    }

    /* ================= ГРАНД-ФИНАЛ: ВОРОТА ================= */
    .gate-curtain-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 50;
      pointer-events: none;
      perspective: 2000px;
      display: none;
    }

    .gate-door {
      position: absolute;
      top: 0;
      width: 50%;
      height: 100%;
      background: linear-gradient(135deg, #1f180f 0%, #060504 100%);
      border: 10px solid #d4af37;
      box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.95);
      transition: transform 4s cubic-bezier(0.4, 0, 0.1, 1);
      transform-style: preserve-3d;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gate-left {
      left: 0;
      transform-origin: left center;
      border-right: 5px solid #ffd700;
    }

    .gate-right {
      right: 0;
      transform-origin: right center;
      border-left: 5px solid #ffd700;
    }

    .gate-grille-decor {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 1px solid rgba(212, 175, 55, 0.12);
      background-image: 
        radial-gradient(circle, transparent 30%, rgba(212, 175, 55, 0.02) 31%),
        linear-gradient(45deg, rgba(212, 175, 55, 0.02) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(212, 175, 55, 0.02) 25%, transparent 25%);
      background-size: 40px 40px;
      pointer-events: none;
    }

    .gate-relief {
      width: 60%;
      max-width: 280px;
      filter: drop-shadow(0 15px 25px rgba(0,0,0,0.95)) sepia(0.2) saturate(1.8);
      position: relative;
      z-index: 2;
    }

    .victory-reveal-stage {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, rgba(255, 215, 0, 0.45) 0%, rgba(2,2,4,1) 75%);
      z-index: 49;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .victory-standard {
      width: 220px;
      height: 220px;
      filter: drop-shadow(0 0 40px rgba(255,215,0,0.85));
      animation: victoryFloat 4s infinite ease-in-out;
    }

    @keyframes victoryFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    /* Портрет для Раунда 1 */
    .screen-portrait-container {
      width: 240px;
      height: 270px;
      border: 3px solid #ffd700;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
      margin: 0 auto 20px auto;
      background: #0d0a05;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.45), inset 0 0 15px rgba(0,0,0,0.8);
    }
    
    .screen-portrait-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.85;
      filter: sepia(0.4) saturate(1.2) contrast(1.1);
    }
    
    .portrait-scanline {
      position: absolute;
      top: 0; left: 0; right: 0; height: 3px;
      background: rgba(255, 215, 0, 0.75);
      box-shadow: 0 0 10px #ffd700;
      animation: portraitScan 3.5s infinite linear;
      pointer-events: none;
    }

    @keyframes portraitScan {
      0% { top: 0%; }
      100% { top: 100%; }
    }

    /* Увеличим турнирную таблицу */
    .full-screen-leaderboard-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(4, 3, 2, 0.94);
      z-index: 40;
      display: none;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      opacity: 0;
      transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
    }
    .full-screen-leaderboard-overlay.active {
      display: flex;
      opacity: 1;
    }
    .leaderboard-scroll {
      width: 85%;
      max-width: 800px;
      background: rgba(18, 14, 9, 0.96);
      border: 3px solid #ffd700;
      border-radius: 12px;
      padding: 35px 40px;
      box-shadow: 0 0 45px rgba(255, 215, 0, 0.25), inset 0 0 30px rgba(0,0,0,0.9);
      position: relative;
      transform: scale(0.9) translateY(20px);
      transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
    }
    .full-screen-leaderboard-overlay.active .leaderboard-scroll {
      transform: scale(1) translateY(0);
    }
    .leaderboard-table-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 480px;
      overflow-y: auto;
      padding-right: 10px;
    }
    .leaderboard-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      background: rgba(45, 36, 22, 0.22);
      border: 1px solid #4a3e26;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    .leaderboard-row.rank-1 {
      background: linear-gradient(90deg, rgba(212, 175, 55, 0.16) 0%, rgba(45, 36, 22, 0.25) 100%);
      border-color: #ffd700;
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.1);
    }
    .leaderboard-row.rank-2 {
      background: linear-gradient(90deg, rgba(192, 192, 192, 0.12) 0%, rgba(45, 36, 22, 0.25) 100%);
      border-color: #c0c0c0;
    }
    .leaderboard-row.rank-3 {
      background: linear-gradient(90deg, rgba(205, 127, 50, 0.1) 0%, rgba(45, 36, 22, 0.25) 100%);
      border-color: #cd7f32;
    }
    .rank-badge {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #27272a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
      font-family: 'Cinzel', serif;
      color: #c4b59f;
      border: 1.5px solid #4a3e26;
    }
    .rank-1 .rank-badge {
      background: #ffd700;
      color: #000;
      border-color: #fff;
      box-shadow: 0 0 10px #ffd700;
    }
    .rank-2 .rank-badge {
      background: #c0c0c0;
      color: #000;
      border-color: #fff;
      box-shadow: 0 0 8px #c0c0c0;
    }
    .rank-3 .rank-badge {
      background: #cd7f32;
      color: #000;
      border-color: #fff;
      box-shadow: 0 0 6px #cd7f32;
    }
    .leaderboard-table-name {
      font-family: 'Cinzel', serif;
      font-size: 18px;
      font-weight: 700;
      color: #f5f5f7;
      flex-grow: 1;
      margin-left: 20px;
      text-align: left;
    }
    .leaderboard-score-val {
      font-family: 'Montserrat', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #ffd700;
      text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
    }
  </style>
</head>
<body>

  <!-- Фон-Матрица -->
  <canvas id="bg-matrix-canvas"></canvas>

  <!-- Голограмма крепости -->
  <div class="hologram-fortress"></div>

  <!-- Голограмма Петра Великого -->
  <div class="hologram-peter" id="screen-hologram-peter"></div>

  <!-- Параллакс волн Невы (В самом низу) -->
  <div class="parallax-wave wave-back"></div>
  <div class="parallax-wave wave-front"></div>

  <div class="screen-overlay">
    
    <!-- Шапка-Логотип -->
    <img src="royal_crown.png" alt="Корона" class="stage-logo">

    <!-- Механический таймер / Астролябия -->
    <div class="timer-container" id="timer-box">
      <div class="astrolabe-gears">
        <svg class="gear-main" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="38"></circle>
          <path d="M 50 2 L 50 10 M 50 90 L 50 98 M 2 50 L 10 50 M 90 50 L 98 50 M 16 16 L 22 22 M 78 78 L 84 84 M 16 84 L 22 78 M 78 16 L 84 22" stroke="currentColor"></path>
        </svg>
        <svg class="gear-secondary" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="18"></circle>
          <path d="M 25 1 L 25 5 M 25 45 L 25 49 M 1 25 L 5 25 M 45 25 L 49 25" stroke="currentColor"></path>
        </svg>
        <svg class="gear-third" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="18"></circle>
          <path d="M 25 1 L 25 5 M 25 45 L 25 49 M 1 25 L 5 25 M 45 25 L 49 25" stroke="currentColor"></path>
        </svg>
      </div>
      <svg class="timer-svg" viewBox="0 0 120 120">
        <circle class="timer-bg-circle" cx="60" cy="60" r="55"></circle>
        <circle class="timer-progress-circle" id="timer-circle" cx="60" cy="60" r="55"></circle>
      </svg>
      <div class="timer-text" id="timer-number">5</div>
    </div>

    <!-- ================= СТЕНДБАЙ-ЭКРАН ================= -->
    <div class="standby-splash" id="screen-standby-splash">
      <img src="название.png" alt="Тайный Вечер" style="max-height: 250px; margin-bottom: 30px; filter: drop-shadow(0 0 45px rgba(255, 215, 0, 0.6));">
      <p style="font-family: 'Playfair Display', serif; font-size: 32px; font-style: italic; color: #ffd700; letter-spacing: 1px; text-shadow: 0 0 20px rgba(255, 215, 0, 0.45); text-transform: uppercase;">
        Интеллектуальная Ассамблея Государя
      </p>
    </div>

    <!-- ================= СВИТОК С ВОПРОСОМ ================= -->
    <div class="parchment-scroll-container" id="screen-parchment-scroll">
      <div class="scroll-corner sc-tl"></div>
      <div class="scroll-corner sc-tr"></div>
      <div class="scroll-corner sc-bl"></div>
      <div class="scroll-corner sc-br"></div>
      
      <div class="round-num-tag" id="screen-round-tag">РАУНД 1</div>
      <!-- Портрет для Раунда 1 -->
      <div class="screen-portrait-container" id="screen-portrait-box" style="display: none;">
        <img id="screen-portrait-img" class="screen-portrait-img" src="петр.png">
        <div class="portrait-scanline"></div>
      </div>
      <div class="question-title" id="screen-question-text">Загрузка вопроса...</div>
      
      <div class="options-grid" id="screen-options-box">
        <!-- Опции квиза -->
      </div>
    </div>

    <!-- ================= СТАБИЛЬНЫЙ ЛИДЕРБОРД "МОРСКАЯ ГАВАНЬ" ================= -->
    <div class="leaderboard-race-container" id="screen-leaderboard">
      <!-- Дорожки для кораблей будут созданы через JS -->
    </div>

  </div>

  <!-- ================= ПОЛНОЭКРАННАЯ ТУРНИРНАЯ ТАБЛИЦА (LEADERBOARD OVERLAY) ================= -->
  <div class="full-screen-leaderboard-overlay" id="screen-fullscreen-leaderboard">
    <div class="leaderboard-scroll">
      <div class="scroll-corner sc-tl"></div>
      <div class="scroll-corner sc-tr"></div>
      <div class="scroll-corner sc-bl"></div>
      <div class="scroll-corner sc-br"></div>
      
      <h2 style="font-family: 'Cinzel', serif; font-size: 38px; color: #ffd700; text-align: center; margin-bottom: 25px; text-shadow: 0 0 15px rgba(255, 215, 0, 0.4); letter-spacing: 1px;">
        ⚜ ТУРНИРНАЯ ТАБЛИЦА АССАМБЛЕИ ⚜
      </h2>
      
      <div class="leaderboard-table-container" id="leaderboard-table-rows">
        <!-- Строки будут добавлены JS -->
      </div>
    </div>
  </div>

  <!-- ================= НЕЙРО-СКАН (РАУНД 2) ================= -->
  <div class="laser-overlay" id="screen-laser-box">
    <div class="laser-line"></div>
    <div class="laser-reticle"></div>
    <div class="holographic-scan-card" id="screen-scan-card">
      <h2>НЕЙРО-СКАНИРОВАНИЕ ЖИВОПИСИ</h2>
      <p style="color: #00e676; margin-top: 10px; font-size: 18px;" id="scan-card-table-name">СТОЛ №—</p>
      <div class="match-percent-circle" id="scan-card-similarity">
        <span style="font-size:12px; font-weight:400; color:rgba(0,230,118,0.5); letter-spacing:1px; margin-bottom:5px;">MATCH</span>
        98%
      </div>
      <p style="font-size: 15px; font-style: italic; color: rgba(0, 230, 118, 0.85);">
        Императорское художественное соответствие подтверждено!
      </p>
    </div>
  </div>

  <!-- ================= ГРАНД-ФИНАЛ: ВОРОТА ================= -->
  <div class="gate-curtain-overlay" id="screen-gates-overlay">
    <div class="gate-door gate-left">
      <div class="gate-grille-decor"></div>
      <img src="royal_crown.png" alt="Рельеф" class="gate-relief" style="transform: rotate(5deg) scale(0.9); margin-left: auto; margin-right: 15px;">
    </div>
    <div class="gate-door gate-right">
      <div class="gate-grille-decor"></div>
      <img src="royal_crown.png" alt="Рельеф" class="gate-relief" style="transform: scaleX(-1) rotate(5deg) scale(0.9); margin-right: auto; margin-left: 15px;">
    </div>
  </div>

  <!-- Победитель за воротами -->
  <div class="victory-reveal-stage" id="screen-victory-stage">
    <img src="royal_crown.png" alt="Штандарт" class="victory-standard">
    <h1 style="font-size: 72px; color: #ffd700; margin-top: 30px; letter-spacing: 3px; font-family: 'Cinzel', serif;">
      ПОБЕДИТЕЛЬ АССАМБЛЕИ
    </h1>
    <h2 style="font-size: 56px; color: #f0f0f0; margin-top: 10px; font-family: 'Cinzel', serif; letter-spacing:1px;" id="victory-table-winner">СТОЛ №3</h2>
    <p style="font-family: 'Playfair Display', serif; font-size: 28px; font-style: italic; color: #d4af37; margin-top: 25px;">
      Жалуем победителю звание Тайного Советника Ассамблеи!
    </p>
  </div>

  <script>
    // --- ПОДКЛЮЧЕНИЕ СЕРВЕРА ---
    let TABLE_NAMES = {}; // Loaded dynamically

    const socketUrl = (window.location.protocol === 'file:' || !window.location.host) ? 'http://localhost:3000' : '';
    const socket = io(socketUrl);

    let tableScores = {};
    let activeTimerLimit = 5;
    let currentRound = 0;

    socket.on('connect', () => {
      console.log('Экран успешно подключился к сокетам');
      socket.emit('quiz_screen_join');
    });

    // Получаем динамический список столов
    socket.on('quiz_tables_update', (tables) => {
      TABLE_NAMES = tables;
      renderLeaderboardLanes();
      updateShipsPositions();
    });

    socket.on('quiz_state_update', (state) => {
      console.log('Quiz state update:', state);
      currentRound = state.currentRound;
      handleStateChange(state);
    });

    socket.on('quiz_scores_update', (scores) => {
      tableScores = scores;
      updateShipsPositions();
    });

    socket.on('quiz_timer_tick', (rem) => {
      const circle = document.getElementById('timer-circle');
      const text = document.getElementById('timer-number');
      if (text) text.textContent = rem;

      if (circle) {
        const perimeter = 2 * Math.PI * 55; // 345
        const progress = rem / activeTimerLimit;
        circle.style.strokeDashoffset = perimeter * (1 - progress);
      }

      if (rem <= 2) {
        text.classList.add('pulse-critical');
      } else {
        text.classList.remove('pulse-critical');
      }
    });

    socket.on('quiz_timer_end', () => {
      const circle = document.getElementById('timer-circle');
      const text = document.getElementById('timer-number');
      if (text) {
        text.textContent = "0";
        text.classList.remove('pulse-critical');
      }
      if (circle) circle.style.strokeDashoffset = 345;
    });

    socket.on('quiz_screen_show_leaderboard', () => {
      showFullscreenLeaderboard(true);
    });

    socket.on('quiz_screen_laser_effect', (data) => {
      const laserOverlay = document.getElementById('screen-laser-box');
      const scanCard = document.getElementById('screen-scan-card');
      const nameLabel = document.getElementById('scan-card-table-name');
      const simLabel = document.getElementById('scan-card-similarity');

      laserOverlay.style.display = 'block';
      const tblNameText = TABLE_NAMES[data.tableNumber] || \`Стол №\${data.tableNumber}\`;
      nameLabel.textContent = \`СТОЛ №\${data.tableNumber} (\${tblNameText})\`;
      simLabel.innerHTML = \`<span style="font-size:12px; font-weight:400; color:rgba(0,230,118,0.5); letter-spacing:1px; margin-bottom:5px;">MATCH</span>\${data.similarity}%\`;
      
      setTimeout(() => {
        scanCard.classList.add('active');
      }, 500);

      setTimeout(() => {
        scanCard.classList.remove('active');
        setTimeout(() => {
          laserOverlay.style.display = 'none';
        }, 600);
      }, 5000);
    });

    function renderLeaderboardLanes() {
      const leaderboardBox = document.getElementById('screen-leaderboard');
      if (!leaderboardBox) return;
      leaderboardBox.innerHTML = '';

      const sortedKeys = Object.keys(TABLE_NAMES).sort((a, b) => parseInt(a) - parseInt(b));
      const count = sortedKeys.length;

      sortedKeys.forEach((key, idx) => {
        const lane = document.createElement('div');
        lane.className = 'race-lane';
        lane.id = \`race-lane-\${key}\`;
        
        const scaleVal = (0.76 + idx * (0.24 / Math.max(count - 1, 1))).toFixed(3);
        const opacityVal = (0.55 + idx * (0.45 / Math.max(count - 1, 1))).toFixed(2);
        
        lane.style.transform = \`scale(\${scaleVal})\`;
        lane.style.opacity = opacityVal;
        
        const label = document.createElement('span');
        label.className = 'lane-label';
        label.textContent = TABLE_NAMES[key];
        lane.appendChild(label);

        // Создаем фрегат
        const ship = document.createElement('div');
        ship.className = 'frigate-ship';
        ship.id = \`frigate-\${key}\`;
        ship.style.left = '10%'; // Стартовая позиция

        ship.innerHTML = \`
          <div class="ship-3d-label">\${TABLE_NAMES[key]}</div>
          <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; fill: #ffd700;">
            <path d="M 12 58 L 88 58 C 84 78, 20 78, 12 58 Z" fill="#5c3f1a" stroke="#ffd700" stroke-width="1.8"/>
            <path d="M 88 58 L 97 50 L 90 56 Z" fill="#ffd700"/>
            <line x1="32" y1="58" x2="32" y2="12" stroke="#ffd700" stroke-width="2.5"/>
            <line x1="55" y1="58" x2="55" y2="5" stroke="#ffd700" stroke-width="2.8"/>
            <line x1="78" y1="58" x2="78" y2="18" stroke="#ffd700" stroke-width="2.5"/>
            <line x1="86" y1="58" x2="98" y2="42" stroke="#ffd700" stroke-width="1.8"/>
            <path d="M 32 18 Q 12 28, 32 37 Z" fill="#fffaef" stroke="#c49a2a" stroke-width="0.8"/>
            <path d="M 32 37 Q 15 45, 32 54 Z" fill="#fffaef" stroke="#c49a2a" stroke-width="0.8"/>
            <path d="M 55 12 Q 25 22, 55 32 Z" fill="#fffaef" stroke="#c49a2a" stroke-width="0.8"/>
            <path d="M 55 32 Q 22 42, 55 54 Z" fill="#fffaef" stroke="#c49a2a" stroke-width="1"/>
            <path d="M 78 22 Q 62 28, 78 36 Z" fill="#fffaef" stroke="#c49a2a" stroke-width="0.8"/>
            <path d="M 78 36 Q 64 44, 78 52 Z" fill="#fffaef" stroke="#c49a2a" stroke-width="0.8"/>
            <path d="M 78 27 Q 88 37, 86 46 Z" fill="#fffaef" stroke="#c49a2a"/>
            <polygon points="32,12 42,15 32,18" fill="#ffd700"/>
            <polygon points="55,5 68,9 55,13" fill="#ef4444"/>
            <polygon points="78,18 85,20 78,22" fill="#ffd700"/>
          </svg>
          <div class="gulf-wake-particle"></div>
          <div class="gulf-wake-particle" style="animation-delay: 0.4s;"></div>
          <div class="gulf-wake-particle" style="animation-delay: 0.8s;"></div>
        \`;
        
        lane.appendChild(ship);
        leaderboardBox.appendChild(lane);
      });
    }

    function handleStateChange(state) {
      const round = state.currentRound;
      const step = state.roundStep;

      // Автоматически скрываем полноэкранную таблицу при активных игровых шагах
      if (step === 'question' || step === 'answers_active') {
        showFullscreenLeaderboard(false);
      } else if (step === 'standby' && round > 0) {
        showFullscreenLeaderboard(true); // Показываем между раундами
      }

      // Настройка видимости голограммы Петра (ярче во время Standby/результатов)
      const peterHolo = document.getElementById('screen-hologram-peter');
      if (peterHolo) {
        peterHolo.style.opacity = (round === 0 || step === 'standby' || step === 'correct_answer') ? '0.18' : '0.03';
      }

      const logo = document.querySelector('.stage-logo');
      const standbySplash = document.getElementById('screen-standby-splash');
      const questionScroll = document.getElementById('screen-parchment-scroll');
      const timerBox = document.getElementById('timer-box');
      const leaderboard = document.getElementById('screen-leaderboard');
      const gates = document.getElementById('screen-gates-overlay');
      const victoryStage = document.getElementById('screen-victory-stage');
      const portraitBox = document.getElementById('screen-portrait-box');

      if (round === 0) {
        if (logo) logo.style.display = 'none'; // Скрываем верхнюю мелкую корону на заставке
        standbySplash.style.display = 'flex';
        questionScroll.classList.remove('active');
        timerBox.classList.remove('active');
        leaderboard.classList.remove('active'); // Скрываем дорожки полностью
        gates.style.display = 'none';
        victoryStage.style.display = 'none';
        portraitBox.style.display = 'none';
        return;
      }

      if (logo) logo.style.display = 'block'; // Показываем мелкую корону в раундах

      // Показываем дорожки в раундах
      if (round === 7 && step === 'correct_answer') {
        leaderboard.classList.remove('active');
      } else {
        leaderboard.classList.add('active');
      }

      standbySplash.style.display = 'none';

      if (round === 2) {
        questionScroll.classList.remove('active');
        timerBox.classList.remove('active');
        portraitBox.style.display = 'none';
        return;
      }

      // Настройка портретов в Раунде 1
      if (round === 1) {
        portraitBox.style.display = 'flex';
        document.getElementById('screen-portrait-img').src = 'петр.png'; 
      } else {
        portraitBox.style.display = 'none';
      }

      if (state.activeQuestion) {
        questionScroll.classList.add('active');
        
        let roundTag = \`РАУНД \${round}\`;
        if (round === 1) {
          roundTag = \`РАУНД 1. Портрет \${state.subQuestionIndex + 1}\`;
        } else if (round === 4) {
          roundTag = \`БЛИЦ. Вопрос \${state.subQuestionIndex + 1}\`;
        } else if (round === 5) {
          roundTag = \`АЛЬЯНС. Шифровка \${state.subQuestionIndex + 1}\`;
        } else if (round === 6) {
          roundTag = \`ПОСЛЫ. Мем \${state.subQuestionIndex + 1}\`;
        }
        document.getElementById('screen-round-tag').textContent = roundTag;
        
        let qText = state.activeQuestion.text;
        if (round === 5) {
          qText += " (Отвечают чётные столы по подсказкам нечётных!)";
        } else if (round === 6) {
          qText += " (Отвечают нечётные столы по подсказкам чётных!)";
        }
        
        document.getElementById('screen-question-text').textContent = qText;

        const optionsBox = document.getElementById('screen-options-box');
        optionsBox.innerHTML = '';
        
        if (state.activeQuestion.options && state.activeQuestion.options.length > 0) {
          state.activeQuestion.options.forEach((opt, idx) => {
            const code = ['A', 'B', 'C', 'D'][idx];
            const div = document.createElement('div');
            div.className = 'option-card';
            div.id = \`opt-card-\${code}\`;
            div.textContent = opt;
            optionsBox.appendChild(div);
          });
        }
      }

      if (step === 'answers_active') {
        activeTimerLimit = state.timerLimit || 5;
        timerBox.classList.add('active');
      } else if (step === 'question' || step === 'standby') {
        timerBox.classList.remove('active');
      }

      if (step === 'correct_answer') {
        timerBox.classList.remove('active');
        const correctCode = state.correctAnswer;
        if (correctCode) {
          document.querySelectorAll('.option-card').forEach(card => {
            if (card.id === \`opt-card-\${correctCode}\`) {
              card.classList.add('correct');
            } else {
              card.classList.add('incorrect');
            }
          });
        }

        if (round === 7) {
          triggerGatesWinner();
        }
      }
    }

    function updateShipsPositions() {
      let maxScore = 0;
      const sortedKeys = Object.keys(TABLE_NAMES);
      if (sortedKeys.length === 0) return;

      sortedKeys.forEach(t => {
        if (tableScores[t] > maxScore) {
          maxScore = tableScores[t];
        }
      });

      const scoreDenominator = maxScore > 0 ? maxScore : 100;

      sortedKeys.forEach(key => {
        const score = tableScores[key] || 0;
        const ship = document.getElementById(\`frigate-\${key}\`);
        if (ship) {
          const leftPercent = 10 + 75 * (score / scoreDenominator);
          ship.style.left = \`\${leftPercent}%\`;

          // Выделяем лидера гонки
          if (score === maxScore && maxScore > 0) {
            ship.classList.add('leader');
            ship.querySelector('svg').style.filter = 'drop-shadow(0 0 16px rgba(255,215,0,0.95))';
          } else {
            ship.classList.remove('leader');
            ship.querySelector('svg').style.filter = 'drop-shadow(0 6px 10px rgba(0,0,0,0.85))';
          }
        }
      });
    }

    function triggerGatesWinner() {
      const sortedKeys = Object.keys(TABLE_NAMES);
      if (sortedKeys.length === 0) return;

      let winnerTable = sortedKeys[0];
      let maxScore = -1;
      
      sortedKeys.forEach(key => {
        const score = tableScores[key] || 0;
        if (score > maxScore) {
          maxScore = score;
          winnerTable = key;
        }
      });

      const gates = document.getElementById('screen-gates-overlay');
      const victoryStage = document.getElementById('screen-victory-stage');
      const winnerLabel = document.getElementById('victory-table-winner');

      const tblNameText = TABLE_NAMES[winnerTable] || \`Стол №\${winnerTable}\`;
      winnerLabel.textContent = \`СТОЛ №\${winnerTable} (\${tblNameText})\`;

      gates.style.display = 'block';

      document.querySelector('.gate-left').style.transform = 'rotateY(0deg)';
      document.querySelector('.gate-right').style.transform = 'rotateY(0deg)';

      setTimeout(() => {
        document.querySelector('.gate-left').style.transform = 'rotateY(-110deg)';
        document.querySelector('.gate-right').style.transform = 'rotateY(110deg)';
        
        victoryStage.style.display = 'flex';
        victoryStage.style.opacity = '0';
        
        let op = 0;
        const fadeInt = setInterval(() => {
          op += 0.05;
          victoryStage.style.opacity = op;
          if (op >= 1) clearInterval(fadeInt);
        }, 80);

      }, 1000);
    }

    function showFullscreenLeaderboard(show) {
      const overlay = document.getElementById('screen-fullscreen-leaderboard');
      if (!overlay) return;
      
      if (show) {
        const rowsContainer = document.getElementById('leaderboard-table-rows');
        if (rowsContainer) {
          rowsContainer.innerHTML = '';
          
          const sortedTables = Object.keys(TABLE_NAMES).map(key => ({
            key: key,
            name: TABLE_NAMES[key],
            score: tableScores[key] || 0
          })).sort((a, b) => b.score - a.score);
          
          sortedTables.forEach((item, idx) => {
            const rank = idx + 1;
            const row = document.createElement('div');
            row.className = \`leaderboard-row rank-\${rank}\`;
            
            // Назначаем красивые значки медалей для первых трех мест
            let medal = rank;
            if (rank === 1) medal = '👑';
            else if (rank === 2) medal = '🛡️';
            else if (rank === 3) medal = '⭐';
            
            row.innerHTML = \`
              <div class="rank-badge">\${medal}</div>
              <div class="leaderboard-table-name">СТОЛ №\${item.key} (\${item.name})</div>
              <div class="leaderboard-score-val">\${item.score} монет</div>
            \`;
            rowsContainer.appendChild(row);
          });
        }
        overlay.style.display = 'flex';
        setTimeout(() => {
          overlay.classList.add('active');
        }, 50);
      } else {
        overlay.classList.remove('active');
        setTimeout(() => {
          overlay.style.display = 'none';
        }, 600);
      }
    }

    // --- background matrix code + stars on canvas ---
    const canvas = document.getElementById('bg-matrix-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    const dustParticles = [];
    
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.75,
        size: 0.6 + Math.random() * 1.6,
        alpha: Math.random(),
        twinkleSpeed: 0.008 + Math.random() * 0.015
      });
    }

    for (let i = 0; i < 25; i++) {
      dustParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1.2 + Math.random() * 3,
        alpha: 0.15 + Math.random() * 0.35,
        speedX: -0.15 - Math.random() * 0.25,
        speedY: (Math.random() - 0.5) * 0.08
      });
    }

    const alphabet = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ⚜⚓⛵⚜⚜";
    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const rainDrops = [];
    for (let x = 0; x < columns; x++) {
      rainDrops[x] = Math.random() * -100;
    }

    function drawMatrix() {
      ctx.fillStyle = 'rgba(3, 2, 2, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }
        ctx.fillStyle = \`rgba(255, 215, 0, \${Math.max(0, star.alpha)})\`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      dustParticles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.y < -10 || p.y > canvas.height + 10) p.y = Math.random() * canvas.height;

        ctx.fillStyle = \`rgba(212, 175, 55, \${p.alpha})\`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (currentRound > 0) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
        ctx.font = fontSize + 'px "Cinzel", serif';

        for (let i = 0; i < rainDrops.length; i++) {
          const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
          ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

          if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.985) {
            rainDrops[i] = 0;
          }
          rainDrops[i]++;
        }
      }
    }

    setInterval(drawMatrix, 45);

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  </script>
</body>
</html>`;

fs.writeFileSync(screenHtmlPath, newScreenHtml, 'utf8');
console.log('Successfully rewrote quiz-screen.html with state-of-the-art Cyber-Baroque design.');
