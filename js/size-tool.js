function initSizeTool() {
  const root = document.querySelector(".size-tool");
  if (!root) return;

  // How far (px, from center x=120) the horizontal line extends at min/max value.
  const LINE_RANGE = { mell: [18, 58], derek: [14, 50], csipo: [20, 62] };

  function setLine(key, value, min, max) {
    const group = root.querySelector(`.size-line[data-line="${key}"]`);
    if (!group) return;
    const [lo, hi] = LINE_RANGE[key];
    const t = (value - min) / (max - min);
    const half = lo + t * (hi - lo);
    const line = group.querySelector("line");
    const circle = group.querySelector("circle");
    line.setAttribute("x1", 120 - half);
    line.setAttribute("x2", 120 + half);
    circle.setAttribute("cx", 120 + half);
  }

  function updateBadge(key, text) {
    const badge = root.querySelector(`.size-badge[data-badge="${key}"] b`);
    if (badge) badge.textContent = text;
  }

  root.querySelectorAll("[data-size-input]").forEach((input) => {
    const key = input.getAttribute("data-size-input");
    const output = root.querySelector(`[data-size-output="${key}"]`);
    const min = Number(input.min);
    const max = Number(input.max);

    function render() {
      const value = Number(input.value);
      const text = value + " cm";
      if (output) output.textContent = text;
      updateBadge(key, text);
      if (key !== "magassag") setLine(key, value, min, max);
    }

    input.addEventListener("input", render);
    render();
  });
}

document.addEventListener("DOMContentLoaded", initSizeTool);
