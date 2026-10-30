/* Gallery exhibition effects; motion preferences are shared through main.js. */
(() => {
  const root = document.querySelector(".gallery-atlas");
  if (!root) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const lifetime = new AbortController();
  const listen = (target, name, handler, options = {}) =>
    target.addEventListener(name, handler, { ...options, signal: lifetime.signal });
  const wall = root.querySelector("[data-gallery-grid]");
  const works = [...root.querySelectorAll("[data-gallery-item]")];
  const dialog = root.querySelector("[data-lightbox]");
  const dialogImage = root.querySelector("[data-lightbox-image]");
  let sleeping = false;
  let effectCleanups = [];
  let heroTrigger = null;
  const moving = () => !reduced.matches && document.documentElement.dataset.motion !== "off" && !sleeping;
  const filmstrip = root.querySelector("[data-filmstrip]");
  let filmstripKey = "";
  const atmosphere = root.querySelector("[data-lightbox-atmosphere]");
  const galleryStatus = root.querySelector("[data-gallery-status]");
  const hero = root.querySelector("[data-exhibit-hero]");
  const transitions = new Map();
  let heroInView = false;

  // Each element owns at most one brief transition; motion preferences cancel it.
  const animate = (element, frames, options) => {
    transitions.get(element)?.cancel();
    if (!moving()) return;
    const animation = element.animate(frames, options);
    transitions.set(element, animation);
    const forget = () => { if (transitions.get(element) === animation) transitions.delete(element); };
    animation.addEventListener("finish", forget, { once: true });
    animation.addEventListener("cancel", forget, { once: true });
  };
  const animateWall = () => animate(wall, [{ opacity: 0.65 }, { opacity: 1 }], { duration: 280, easing: "ease-out" });
  const updateHeroVisibility = () => { hero.dataset.inView = String(heroInView && !document.hidden); };
  const heroObserver = new IntersectionObserver(([entry]) => {
    heroInView = entry.isIntersecting;
    updateHeroVisibility();
  });
  heroObserver.observe(hero);
  listen(document, "visibilitychange", updateHeroVisibility);

  // Images remain visible without JavaScript; a first-view lift adds only polish.
  const workObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.hidden) return;
      workObserver.unobserve(entry.target);
      animate(entry.target, [{ opacity: 0.75, translate: "0 16px" }, { opacity: 1, translate: "0 0" }], { duration: 550, easing: "cubic-bezier(.2,.7,.25,1)" });
    });
  }, { threshold: 0.12 });
  works.forEach((work) => workObserver.observe(work));

  const updateSlots = () => {
    const shown = works.filter((work) => !work.hidden);
    wall.dataset.filtered = String(shown.length !== works.length);
    shown.forEach((work, index) => { work.dataset.layoutSlot = String(index % 7); });
    const region = root.querySelector('[data-filter][aria-pressed="true"]')?.textContent || "All places";
    galleryStatus.textContent = `${shown.length} photographs · ${region}`;
  };
  updateSlots();
  const filterObserver = new MutationObserver(() => { updateSlots(); animateWall(); });
  filterObserver.observe(wall, { subtree: true, attributes: true, attributeFilter: ["hidden"] });

  root.querySelectorAll("[data-exhibit-view]").forEach((button) => {
    listen(button, "click", () => {
      if (wall.dataset.exhibitLayout === button.dataset.exhibitView) return;
      wall.dataset.exhibitLayout = button.dataset.exhibitView;
      animateWall();
      root.querySelectorAll("[data-exhibit-view]").forEach((option) => {
        option.setAttribute("aria-pressed", String(option === button));
      });
    });
  });

  root.querySelectorAll("[data-open-photo]").forEach((button) => {
    listen(button, "click", () => {
      const work = works.find((item) => item.querySelector("img").src.endsWith(button.dataset.openPhoto));
      if (!work) return;
      if (work.hidden) root.querySelector('[data-filter="all"]').click();
      heroTrigger = button;
      work.click();
    });
  });
  const updatePhotoPosition = () => {
    atmosphere.style.backgroundImage = `url("${dialogImage.src}")`;
    const shown = works.filter((work) => !work.hidden);
    const index = shown.findIndex((work) => work.querySelector("img").src === dialogImage.src);
    const region = index >= 0 ? shown[index].querySelector(".exhibit-region").textContent : "";
    root.querySelector("[data-photo-position]").textContent =
      `${String(index + 1).padStart(2, "0")} / ${String(shown.length).padStart(2, "0")} · ${region}`;
    const key = shown.map((work) => work.dataset.caption).join("|");
    if (key !== filmstripKey) {
      filmstripKey = key;
      filmstrip.replaceChildren(...shown.map((work, photoIndex) => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", `View ${work.dataset.caption}`);
        const image = document.createElement("img");
        image.src = work.querySelector("img").src;
        image.alt = "";
        image.width = 96;
        image.height = 64;
        image.decoding = "async";
        button.append(image);
        button.addEventListener("click", () => dialog.dispatchEvent(new CustomEvent("gallery:select-photo", { detail: { index: photoIndex } })));
        return button;
      }));
    }
    [...filmstrip.children].forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.setAttribute("aria-pressed", String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && dialog.open) {
        filmstrip.scrollTo({ left: button.offsetLeft - filmstrip.clientWidth / 2 + button.clientWidth / 2, behavior: "instant" });
        if (filmstrip.contains(document.activeElement)) button.focus({ preventScroll: true });
      }
    });
  };
  listen(filmstrip, "keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const buttons = [...filmstrip.children];
    const index = buttons.indexOf(document.activeElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.click();
  });
  listen(dialogImage, "load", () => {
    if (dialog.open) animate(dialogImage, [{ opacity: 0.35 }, { opacity: 1 }], { duration: 300, easing: "ease-out" });
  });
  const imageObserver = new MutationObserver(updatePhotoPosition);
  imageObserver.observe(dialogImage, { attributes: true, attributeFilter: ["src"] });
  listen(dialog, "close", () => {
    transitions.get(dialogImage)?.cancel();
    heroTrigger?.focus();
    heroTrigger = null;
  });
  listen(dialog, "click", (event) => {
    if (event.target.matches(".lightbox-panel")) dialog.close();
  });

  // Letter springs: mass 1, tension 200, friction 20, 35ms per-letter stagger.
  // Text remains one accessible heading; the visual letters are decorative.
  const headings = [];
  const activeSprings = new Set();
  let springFrame = 0;
  let previousSpringTime = 0;
  root.querySelectorAll("[data-spring-heading]").forEach((heading) => {
    heading.setAttribute("aria-label", heading.innerText.replace(/\s+/g, " ").trim());
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const letters = [];
    nodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).filter(Boolean).forEach((part) => {
        if (/^\s+$/.test(part)) {
          fragment.append(document.createTextNode(part));
          return;
        }
        const word = document.createElement("span");
        word.className = "exhibit-spring-word";
        word.setAttribute("aria-hidden", "true");
        Array.from(part).forEach((character) => {
          const letter = document.createElement("span");
          letter.className = "exhibit-spring-letter";
          letter.textContent = character;
          word.append(letter);
          letters.push({ element: letter, position: 0, velocity: 0 });
        });
        fragment.append(word);
      });
      node.replaceWith(fragment);
    });
    headings.push({ heading, letters, started: false, start: 0 });
  });
  const finishHeading = (item) => {
    item.letters.forEach(({ element }) => {
      element.style.removeProperty("transform");
      element.style.removeProperty("opacity");
    });
    activeSprings.delete(item);
  };
  const springStep = (now) => {
    const elapsed = Math.min((now - previousSpringTime) / 1000 || 0.016, 0.032);
    previousSpringTime = now;
    if (!moving()) {
      activeSprings.forEach(finishHeading);
      springFrame = 0;
      return;
    }
    activeSprings.forEach((item) => {
      let settled = 0;
      item.letters.forEach((letter, index) => {
        if (now < item.start + index * 35) return;
        const dt = elapsed / 3;
        for (let substep = 0; substep < 3; substep++) {
          letter.velocity += (200 * (1 - letter.position) - 20 * letter.velocity) * dt;
          letter.position += letter.velocity * dt;
        }
        letter.element.style.transform = `perspective(600px) rotateX(${((1 - letter.position) * 90).toFixed(3)}deg)`;
        letter.element.style.opacity = String(Math.max(0, Math.min(1, letter.position)));
        if (Math.abs(1 - letter.position) < 0.002 && Math.abs(letter.velocity) < 0.01) settled++;
      });
      if (settled === item.letters.length) finishHeading(item);
    });
    springFrame = activeSprings.size ? requestAnimationFrame(springStep) : 0;
  };
  const headingObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const item = headings.find((value) => value.heading === entry.target);
      headingObserver.unobserve(entry.target);
      if (!item || item.started) return;
      item.started = true;
      if (!moving()) return;
      item.start = performance.now();
      item.letters.forEach(({ element }) => {
        element.style.opacity = "0";
        element.style.transform = "perspective(600px) rotateX(90deg)";
      });
      activeSprings.add(item);
      if (!springFrame) {
        previousSpringTime = performance.now();
        springFrame = requestAnimationFrame(springStep);
      }
    });
  }, { threshold: 0.25 });
  headings.forEach((item) => headingObserver.observe(item.heading));

  // A responsive, single-triangle atmospheric field inspired by the supplied Soffit
  // and Cosmic Dust studies. The photograph collection stays regular semantic HTML.
  function mountAtmosphere() {
    const host = root.querySelector("[data-exhibit-atmosphere]");
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl2", {
      alpha: false, antialias: false, depth: false, stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) return () => {};
    const vertex = `#version 300 es
      void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}`;
    const fragment = `#version 300 es
      precision highp float;
      out vec4 colour;
      uniform vec2 resolution;
      uniform vec2 pointer;
      uniform float time;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),
          mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);
      }
      float air(vec2 p){
        float result=0.,amp=.5;
        for(int i=0;i<4;i++){result+=noise(p)*amp;p=p*2.13+2.7;amp*=.51;}
        return result;
      }
      void main(){
        vec2 uv=(gl_FragCoord.xy-.5*resolution)/resolution.y;
        vec2 p=uv-pointer*.035;
        float t=time*.035;
        float warp=air(p*2.6+vec2(t*.5,-t));
        float axis=p.x*.6+p.y*.8+sin(p.x*2.+t)*.25;
        float wave=sin(axis*4.2+warp*3.-t)*.5+.5;
        float light=pow(wave,3.)*(.35+.65*air(p+vec2(t)));
        vec3 navy=vec3(.018,.085,.12),teal=vec3(.08,.36,.36),mint=vec3(.4,.63,.48);
        vec3 col=mix(navy,teal,light*.72);
        col+=mint*pow(light,3.)*.2;
        float warm=exp(-length(p-vec2(-.65,-.5))*1.8);
        col+=vec3(.36,.19,.065)*warm*.32;
        for(int i=0;i<24;i++){
          float n=float(i);
          vec2 pos=vec2(hash(vec2(n,1.)),hash(vec2(n,8.)));
          pos=fract(pos+vec2(sin(n)*time*.002,time*.004))-.5;
          pos.x*=resolution.x/resolution.y;
          float point=exp(-length(p-pos)*(320.+n*8.));
          col+=vec3(.9,.65,.3)*point*(.25+.2*sin(time*.7+n));
        }
        col*=1.-.25*dot(uv,uv);
        col+=(hash(gl_FragCoord.xy)-.5)/255.;
        colour=vec4(clamp(col,0.,1.),1.);
      }`;
    const shaders = [];
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error("Atmosphere shader unavailable");
      }
      shaders.push(shader);
      return shader;
    };
    const program = gl.createProgram();
    let vao;
    try {
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Atmosphere unavailable");
      gl.useProgram(program);
      vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
    } catch {
      shaders.forEach((shader) => gl.deleteShader(shader));
      gl.deleteProgram(program);
      return () => {};
    }
    host.append(canvas);
    const scope = new AbortController();
    const resolutionLocation = gl.getUniformLocation(program, "resolution");
    const pointerLocation = gl.getUniformLocation(program, "pointer");
    const timeLocation = gl.getUniformLocation(program, "time");
    let frame = 0, previous = 0, clock = 0, visible = true, lost = false;
    const pointer = { x: 0, y: 0, ax: 0, ay: 0, tx: 0, ty: 0 };
    const resize = () => {
      const bounds = host.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(bounds.width * Math.min(devicePixelRatio || 1, 1)));
      canvas.height = Math.max(1, Math.round(bounds.height * Math.min(devicePixelRatio || 1, 1)));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const render = (now) => {
      frame = 0;
      if (!visible || document.hidden || lost) return;
      const dt = Math.min((now - previous) / 1000 || 0.016, 0.05);
      previous = now;
      clock += dt;
      const lead = 1 - Math.pow(1 - 0.105, dt * 60);
      const body = 1 - Math.pow(1 - 0.043, dt * 60);
      pointer.ax += (pointer.tx - pointer.ax) * lead;
      pointer.ay += (pointer.ty - pointer.ay) * lead;
      pointer.x += (pointer.ax - pointer.x) * body;
      pointer.y += (pointer.ay - pointer.y) * body;
      gl.uniform2f(pointerLocation, pointer.x, pointer.y);
      gl.uniform1f(timeLocation, clock);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(render);
    };
    const resume = () => {
      if (!frame && visible && !document.hidden && !lost) {
        previous = performance.now();
        frame = requestAnimationFrame(render);
      }
    };
    const visibilityObserver = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (!visible) { cancelAnimationFrame(frame); frame = 0; }
      else resume();
    });
    visibilityObserver.observe(host);
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(host);
    root.querySelector("[data-exhibit-hero]").addEventListener("pointermove", (event) => {
      const bounds = host.getBoundingClientRect();
      pointer.tx = (event.clientX - bounds.left - bounds.width / 2) / bounds.height;
      pointer.ty = 0.5 - (event.clientY - bounds.top) / bounds.height;
    }, { passive: true, signal: scope.signal });
    document.addEventListener("visibilitychange", resume, { signal: scope.signal });
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(frame);
      canvas.remove();
    }, { signal: scope.signal });
    resize();
    resume();
    return () => {
      scope.abort();
      cancelAnimationFrame(frame);
      visibilityObserver.disconnect();
      sizeObserver.disconnect();
      gl.deleteVertexArray(vao);
      shaders.forEach((shader) => gl.deleteShader(shader));
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }

  // Additive butterfly: the native cursor remains untouched, with one rAF loop.
  function mountButterfly() {
    const canvas = document.createElement("canvas");
    canvas.className = "exhibit-butterfly";
    canvas.setAttribute("aria-hidden", "true");
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => {};
    document.body.append(canvas);
    const scope = new AbortController();
    let dpr = 1, frame = 0, previous = 0, clock = 0;
    let active = false, interactive = false;
    let x = 0, y = 0, tx = 0, ty = 0, bank = 0;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(92 * dpr);
      canvas.height = Math.round(92 * dpr);
    };
    const wing = (sign, spread, gradient) => {
      ctx.save();
      ctx.scale(sign * spread, 1);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.bezierCurveTo(4, -13, 15, -14, 11, -3);
      ctx.bezierCurveTo(16, 8, 4, 10, 0, 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    const render = (now) => {
      frame = 0;
      if (!active || document.hidden) return;
      const dt = Math.min((now - previous) / 1000 || 0.016, 0.05);
      previous = now;
      clock += dt;
      const follow = 1 - Math.pow(1 - 0.11, dt * 60);
      const dx = tx - x;
      x += dx * follow;
      y += (ty - y) * follow;
      bank += (Math.max(-0.65, Math.min(0.65, dx * 0.025)) - bank) * follow;
      const wanderX = Math.sin(clock * 0.9) * 14;
      const wanderY = Math.cos(clock * 0.7) * 9;
      canvas.style.transform = `translate3d(${x - 46 + wanderX}px,${y - 46 + wanderY}px,0)`;
      canvas.style.opacity = dialog.open ? "0" : "1";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, 92, 92);
      ctx.translate(46, 46);
      ctx.rotate(bank);
      if (interactive) ctx.scale(1.12, 1.12);
      ctx.shadowColor = "#9ae4c9";
      ctx.shadowBlur = interactive ? 12 : 6;
      const gradient = ctx.createLinearGradient(-11, -14, 11, 10);
      gradient.addColorStop(0, "#c9ffbc");
      gradient.addColorStop(1, "#5B9BF6");
      const spread = 0.2 + Math.abs(Math.sin(clock * 9.5 * Math.PI * 2)) * 0.8;
      wing(-1, spread, gradient);
      wing(1, spread, gradient);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#d6f7dd";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 8);
      ctx.moveTo(0, -5);
      ctx.lineTo(-3, -9);
      ctx.moveTo(0, -5);
      ctx.lineTo(3, -9);
      ctx.stroke();
      frame = requestAnimationFrame(render);
    };
    const aim = (event) => {
      tx = event.clientX; ty = event.clientY;
      interactive = Boolean(event.target.closest?.("a, button, input"));
      if (!active) {
        active = true; x = tx; y = ty; previous = performance.now();
      }
      if (!frame) frame = requestAnimationFrame(render);
    };
    const hide = () => { active = false; cancelAnimationFrame(frame); frame = 0; canvas.style.opacity = "0"; };
    document.addEventListener("pointermove", aim, { passive: true, signal: scope.signal });
    document.addEventListener("pointerleave", hide, { signal: scope.signal });
    window.addEventListener("blur", hide, { signal: scope.signal });
    window.addEventListener("resize", resize, { passive: true, signal: scope.signal });
    document.addEventListener("visibilitychange", () => { if (document.hidden) hide(); }, { signal: scope.signal });
    resize();
    return () => { scope.abort(); hide(); canvas.remove(); };
  }

  let tiltFrame = 0;
  let tiltedWork = null;
  const installation = root.querySelector("[data-photo-installation]");
  listen(root, "pointermove", (event) => {
    if (!moving() || !fine.matches) return;
    cancelAnimationFrame(tiltFrame);
    const work = event.target.closest("[data-gallery-item]");
    const inHero = event.target.closest("[data-exhibit-hero]");
    tiltFrame = requestAnimationFrame(() => {
      if (tiltedWork && tiltedWork !== work) {
        tiltedWork.style.removeProperty("--tilt-x");
        tiltedWork.style.removeProperty("--tilt-y");
      }
      tiltedWork = work;
      if (work) {
        const bounds = work.getBoundingClientRect();
        work.style.setProperty("--glint-x", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
        work.style.setProperty("--glint-y", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
        work.style.setProperty("--tilt-x", `${((event.clientX - bounds.left) / bounds.width - 0.5) * 3}deg`);
        work.style.setProperty("--tilt-y", `${((event.clientY - bounds.top) / bounds.height - 0.5) * -3}deg`);
      }
      if (inHero) {
        const bounds = inHero.getBoundingClientRect();
        installation.style.setProperty("--float-x", `${(event.clientX / bounds.width - 0.5) * 12}px`);
        installation.style.setProperty("--float-y", `${((event.clientY - bounds.top) / bounds.height - 0.5) * 12}px`);
      }
    });
  }, { passive: true });
  listen(root, "pointerleave", () => {
    tiltedWork?.style.removeProperty("--tilt-x");
    tiltedWork?.style.removeProperty("--tilt-y");
    installation.style.removeProperty("--float-x");
    installation.style.removeProperty("--float-y");
  });

  const reconcileMotion = () => {
    effectCleanups.forEach((cleanup) => cleanup());
    effectCleanups = [];
    const allowed = moving();
    root.dataset.exhibitMotion = allowed ? "on" : "off";
    if (!allowed) {
      transitions.forEach((animation) => animation.cancel());
      transitions.clear();
      activeSprings.forEach(finishHeading);
      cancelAnimationFrame(springFrame);
      springFrame = 0;
      cancelAnimationFrame(tiltFrame);
      works.forEach((work) => { work.style.removeProperty("--tilt-x"); work.style.removeProperty("--tilt-y"); });
      installation.style.removeProperty("--float-x");
      installation.style.removeProperty("--float-y");
    } else if (fine.matches) {
      effectCleanups.push(mountAtmosphere(), mountButterfly());
    }
  };
  listen(window, "sctt:motion-change", reconcileMotion);
  listen(fine, "change", reconcileMotion);
  listen(window, "pagehide", (event) => {
    sleeping = true;
    reconcileMotion();
    if (!event.persisted) {
      lifetime.abort();
      filterObserver.disconnect();
      imageObserver.disconnect();
      headingObserver.disconnect();
      heroObserver.disconnect();
      workObserver.disconnect();
    }
  });
  listen(window, "pageshow", () => { sleeping = false; reconcileMotion(); });
  reconcileMotion();
})();

