/**
 * 粒子连线背景 - corona.studio/lx/download 复刻版
 * 极简暗色科技风 · 浅蓝柔光粒子 · 慢速漂浮 · 鼠标吸附
 */
(function() {
  'use strict';

  // ====== 配置参数 ======
  var BG_COLOR = '#0a0a12';               // 纯深炭黑背景
  var PARTICLE_COUNT = 85;                // 粒子数量
  var CONNECT_DIST = 150;                 // 连线距离阈值
  var MOUSE_RADIUS = 160;                // 鼠标影响半径
  var PARTICLE_MIN_SIZE = 1.2;            // 粒子最小尺寸
  var PARTICLE_MAX_SIZE = 2.8;            // 粒子最大尺寸
  var PARTICLE_OPACITY_MIN = 0.25;        // 粒子最低不透明度
  var PARTICLE_OPACITY_MAX = 0.55;        // 粒子最高不透明度
  var LINE_OPACITY_MAX = 0.12;            // 连线最大不透明度
  var LINE_WIDTH = 0.5;                   // 连线粗细
  var MOUSE_FORCE = 0.015;                // 鼠标引力强度（柔和）
  var DRIFT_SPEED = 0.15;                 // 随机漂移速度（慢速）
  var DAMPING = 0.995;                    // 阻尼系数
  var MAX_SPEED = 0.6;                    // 最大运动速度

  // ====== Canvas 初始化 ======
  var canvas = document.createElement('canvas');
  canvas.id = 'particles-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;display:block;';
  document.body.prepend(canvas);

  var ctx = canvas.getContext('2d');
  var particles = [];
  var mouseX = -9999;
  var mouseY = -9999;
  var animId = null;
  var isRunning = true;

  // ====== 尺寸自适应 ======
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // ====== 粒子类 ======
  function Particle() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = PARTICLE_MIN_SIZE + Math.random() * (PARTICLE_MAX_SIZE - PARTICLE_MIN_SIZE);
    this.vx = (Math.random() - 0.5) * DRIFT_SPEED;
    this.vy = (Math.random() - 0.5) * DRIFT_SPEED;
    this.opacity = PARTICLE_OPACITY_MIN + Math.random() * (PARTICLE_OPACITY_MAX - PARTICLE_OPACITY_MIN);
    // 粒子自带柔和光晕（用 shadowBlur 实现）
    this.glow = this.size * 3.5;
  }

  Particle.prototype.update = function() {
    // 鼠标引力扰动（柔和吸附效果）
    var dx = mouseX - this.x;
    var dy = mouseY - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MOUSE_RADIUS && dist > 0.5) {
      var force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;
    }

    // 随机微小漂移（模拟无规则漂浮）
    this.vx += (Math.random() - 0.5) * 0.012;
    this.vy += (Math.random() - 0.5) * 0.012;

    // 阻尼限速
    this.vx *= DAMPING;
    this.vy *= DAMPING;
    var speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > MAX_SPEED) {
      this.vx = (this.vx / speed) * MAX_SPEED;
      this.vy = (this.vy / speed) * MAX_SPEED;
    }

    this.x += this.vx;
    this.y += this.vy;

    // 边界反弹（带软性缓冲）
    if (this.x < 0) { this.x = 0; this.vx *= -0.5; }
    if (this.x > canvas.width) { this.x = canvas.width; this.vx *= -0.5; }
    if (this.y < 0) { this.y = 0; this.vy *= -0.5; }
    if (this.y > canvas.height) { this.y = canvas.height; this.vy *= -0.5; }
  };

  Particle.prototype.draw = function() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    // 柔和蓝色光晕
    ctx.shadowColor = 'rgba(74, 141, 183, ' + (this.opacity * 0.4) + ')';
    ctx.shadowBlur = this.glow;
    ctx.fillStyle = 'rgba(160, 200, 230, ' + this.opacity + ')';
    ctx.fill();
    ctx.restore();
  };

  // ====== 初始化粒子 ======
  function initParticles() {
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  // ====== 绘制连线 ======
  function drawConnections() {
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECT_DIST) {
          // 距离越近连线越明显，越远越淡（缓慢消失）
          var ratio = 1 - dist / CONNECT_DIST;
          var alpha = ratio * LINE_OPACITY_MAX;

          // 鼠标附近的连线稍微明显一点（还原官网效果）
          var nearMouse = isNearMouse(particles[i].x, particles[i].y) ||
                          isNearMouse(particles[j].x, particles[j].y);
          if (nearMouse) alpha *= 1.6;

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(130, 175, 215, ' + alpha + ')';
          ctx.lineWidth = LINE_WIDTH;
          ctx.stroke();
        }
      }
    }
  }

  function isNearMouse(x, y) {
    var dx = x - mouseX;
    var dy = y - mouseY;
    return (dx * dx + dy * dy) < (MOUSE_RADIUS * MOUSE_RADIUS);
  }

  // ====== 动画主循环 ======
  function animate() {
    if (!isRunning) {
      animId = null;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 先画连线（在粒子下方更自然）
    drawConnections();

    // 再画粒子
    for (var i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    animId = requestAnimationFrame(animate);
  }

  // ====== 可见性检测（页面隐藏时暂停） ======
  function handleVisibility() {
    if (document.hidden) {
      isRunning = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    } else {
      isRunning = true;
      if (!animId) animate();
    }
  }

  // ====== 鼠标 / 触控事件 ======
  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function onMouseLeave() {
    mouseX = -9999;
    mouseY = -9999;
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  }

  function onTouchEnd() {
    mouseX = -9999;
    mouseY = -9999;
  }

  // ====== 启动 ======
  resize();
  initParticles();
  animate();

  window.addEventListener('resize', function() {
    resize();
  });

  document.addEventListener('visibilitychange', handleVisibility);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('touchmove', onTouchMove, { passive: true });
  document.addEventListener('touchend', onTouchEnd);
})();
