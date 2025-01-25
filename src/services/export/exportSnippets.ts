export const MIXER_JS = `
      // MIXER CODE for GUI (if there are global variables)
      const mixer = document.querySelector('#webchuck-gui');
      const sliders = [...chuckCode.matchAll(/\\bglobal float\\s+(\\w+)\\b/g)]
          .map(([, variable]) => variable);

      if (sliders.length > 0) mixer.style.display = 'flex';

      sliders.forEach(variable => {
        const div = document.createElement('div');
        div.classList.add('webchuck-slider');

        const p = document.createElement('p');
        p.textContent = variable;

        const input = document.createElement('input');
        input.setAttribute('type', 'range');
        input.setAttribute('min', '0');
        input.setAttribute('max', '1');
        input.setAttribute('value', '0');
        input.setAttribute('step', '0.01');

        div.append(p, input);
        mixer.append(div);

        input.addEventListener('input', e => theChuck?.setFloat(variable, +e.target.value));
      });`;
