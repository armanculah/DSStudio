// frontend/src/visualizers/viewportController.js

const clamp = (value, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);

export function createViewportController({
  container,
  horizontal = {},
  vertical = {},
}) {
  if (!container) {
    return {
      setMode: () => {},
      update: () => {},
    };
  }

  const state = {
    mode: { horizontal: false, vertical: false },
    raf: null,
  };

  const getRange = (axis) => {
    if (axis === "horizontal") {
      return container.scrollWidth - container.clientWidth;
    }
    return container.scrollHeight - container.clientHeight;
  };

  const updateAxis = (axisConfig, axisKey) => {
    if (!axisConfig?.wrapper || !axisConfig?.slider) return;
    const enabled = state.mode[axisKey];
    if (!enabled) {
      axisConfig.wrapper.classList.add("hidden");
      axisConfig.slider.value = "0";
      return;
    }

    const range = getRange(axisKey);
    if (range <= 0) {
      axisConfig.wrapper.classList.add("hidden");
      axisConfig.slider.value = "0";
      axisConfig.slider.disabled = true;
      return;
    }

    axisConfig.wrapper.classList.remove("hidden");
    axisConfig.slider.disabled = false;

    const ratio =
      axisKey === "horizontal"
        ? container.scrollLeft / range
        : container.scrollTop / range;
    axisConfig.slider.value = String(Math.round(clamp(ratio * 100)));
  };

  const scheduleUpdate = () => {
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = requestAnimationFrame(() => {
      state.raf = null;
      updateAxis(horizontal, "horizontal");
      updateAxis(vertical, "vertical");
    });
  };

  const setMode = ({ horizontal: h = false, vertical: v = false } = {}) => {
    const nextHorizontal = Boolean(h);
    const nextVertical = Boolean(v);
    state.mode.horizontal = nextHorizontal;
    state.mode.vertical = nextVertical;

    if (!nextHorizontal) {
      horizontal?.wrapper?.classList.add("hidden");
      horizontal?.slider && (horizontal.slider.value = "0");
      container.scrollLeft = 0;
    }
    if (!nextVertical) {
      vertical?.wrapper?.classList.add("hidden");
      vertical?.slider && (vertical.slider.value = "0");
      container.scrollTop = 0;
    }
    scheduleUpdate();
  };

  horizontal?.slider?.addEventListener("input", (event) => {
    if (!state.mode.horizontal) return;
    const range = getRange("horizontal");
    if (range <= 0) return;
    const ratio = clamp(Number(event.target.value), 0, 100) / 100;
    container.scrollLeft = range * ratio;
  });

  vertical?.slider?.addEventListener("input", (event) => {
    if (!state.mode.vertical) return;
    const range = getRange("vertical");
    if (range <= 0) return;
    const ratio = clamp(Number(event.target.value), 0, 100) / 100;
    container.scrollTop = range * ratio;
  });

  container.addEventListener("scroll", scheduleUpdate);
  window.addEventListener("resize", scheduleUpdate);

  return {
    setMode,
    update: scheduleUpdate,
  };
}
