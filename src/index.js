// import _ from 'lodash';
import './style.css';

// import from src modules
import display from './methods.js';
import Interactive from './interactive.js';

const inputList = document.getElementById('inputList');
const addList = document.getElementById('addList');

inputList.addEventListener('submit', (e) => {
  e.preventDefault();
  display.addLists(addList.value);
  addList.value = '';
});

// Clear completed
//
// Note: Interactive handles storage update + re-render
//
document.querySelector('#btnClear').addEventListener('click', Interactive.clearCompletedToDoLists);

// Filters wiring
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    display.setFilter(btn.dataset.filter);
  });
});

window.addEventListener('load', () => {
  document.addEventListener('listUpdated', () => {
    Interactive.checkStatusEvent();
  }, false);
  Interactive.checkStatusEvent();
});

display.showLists();
