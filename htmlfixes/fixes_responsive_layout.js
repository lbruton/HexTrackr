// JavaScript fixes for responsive layout

document.addEventListener('DOMContentLoaded', () => {
  const gridElement = document.querySelector('.ag-grid');
  if (gridElement) {
    const resizeGrid = () => {
      gridElement.style.width = '100%';
      gridElement.style.height = `${window.innerHeight - 100}px`;
    };

    resizeGrid();
    window.addEventListener('resize', resizeGrid);
  }
});
