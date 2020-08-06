// listen for fullscreen change event
const FullScreenEvent = (callback: () => void) => {
  const fullScreenChange = () => {
    const times = [50, 100, 200, 500, 1000, 2000, 5000];
    times.forEach((time) => {
      window.setTimeout(() => {
        callback();
      }, time);
    });
  };
  const vendors = ['webkit', 'moz', 'ms', ''];
  vendors.forEach((prefix) => {
    document.addEventListener(prefix + 'fullscreenchange', fullScreenChange, false);
  });
  document.addEventListener('MSFullscreenChange', fullScreenChange, false);
};
export default FullScreenEvent;
