// import from src modules folder

import DataList from './datalist.js';

// get listed inputs from local storage

export default class display {
  static currentFilter = 'all';

  static getToDoListFromStorage = () => {
    let toDoLists;

    if (JSON.parse(localStorage.getItem('LocalDataList')) === null) {
      toDoLists = [];
    } else {
      toDoLists = JSON.parse(localStorage.getItem('LocalDataList'));
    }
    return toDoLists;
  };

  // add listed inputs to the local storage
  static addListToStorage = (toDoLists) => {
    const item = JSON.stringify(toDoLists);
    localStorage.setItem('LocalDataList', item);
  };

  // index list inputs by number
  static newIndexNum = (toDoLists) => {
    toDoLists.forEach((item, i) => {
      item.index = i + 1;
    });
  }

  // delete from local storage by array index (old method - kept for compatibility)
    static deleteListData = (id) => {
      let toDoLists = this.getToDoListFromStorage();
      const ListItemToDelete = toDoLists[id];

      toDoLists = toDoLists.filter((item) => item !== ListItemToDelete);

      this.newIndexNum(toDoLists);
      this.addListToStorage(toDoLists);
    };

    // delete from local storage by task index (works with filtering)
    static deleteListDataByIndex = (taskIndex) => {
      let toDoLists = this.getToDoListFromStorage();
      
      // Find and remove the task by its index property
      toDoLists = toDoLists.filter((item) => item.index !== taskIndex);
      
      this.newIndexNum(toDoLists);
      this.addListToStorage(toDoLists);
    };

    static ListInputUpdate = (newDescription, id) => {
      const toDoLists = this.getToDoListFromStorage();
      const updateList = toDoLists[id];

      toDoLists.forEach((item) => {
        if (item === updateList) {
          item.description = newDescription;
        }
      });

      this.addListToStorage(toDoLists);
      this.showLists();
    };

    // Update task by index (works with filtering)
    static updateListByIndex = (newDescription, taskIndex) => {
      const toDoLists = this.getToDoListFromStorage();
      
      toDoLists.forEach((item) => {
        if (item.index === taskIndex) {
          item.description = newDescription;
        }
      });
      
      this.addListToStorage(toDoLists);
      this.showLists();
    };

    static removeToDoListBtn = () => {
      document.querySelectorAll('.remove_btn').forEach((button) => button.addEventListener('click', (event) => {
        event.preventDefault();
        const taskIndex = parseInt(button.id);
        this.deleteListDataByIndex(taskIndex);
        this.showLists();
      }));
    };

    // section created dynamically
    static toDoListsHtml = ({ description, index }, statusCheck, statusCompleted) => {
      const ul = document.createElement('ul');
      ul.className = 'to-do';
      ul.innerHTML = `
        <li><input class="checkbox" id="${index}" type="checkbox" ${statusCheck}></li> 
        <li><input id="LIST${index}" type="text" class="text${statusCompleted}" value="${description}" readonly></li>
        <li class="remove-edit">
        <button class="edit_list_btn" id="${index}"><i class="fa fa-pencil icon"></i></button>
        <button class="remove_btn" id="${index}"><i class="fa fa-trash-can icon"></i></button>
        </li>
      `;
      return ul;
    }

    // helper to filter by current filter
    static filterLists = (lists) => {
      if (this.currentFilter === 'active') return lists.filter((i) => !i.completed);
      if (this.currentFilter === 'completed') return lists.filter((i) => i.completed);
      return lists;
    }

    static setFilter = (filter) => {
      this.currentFilter = filter;
      this.showLists();
    }

    // show listed tasks
    static showLists = () => {
      const toDoLists = this.getToDoListFromStorage();
      const filtered = this.filterLists(toDoLists);
      document.querySelector('.toDoListContainer').innerHTML = '';
      filtered.forEach((item) => {
        let statusCheck;
        let statusCompleted;
        if (item.completed === true) {
          statusCheck = 'checked';
          statusCompleted = 'completed';
        } else {
          statusCheck = '';
          statusCompleted = '';
        }
        document.querySelector('.toDoListContainer').appendChild(this.toDoListsHtml(item, statusCheck, statusCompleted));
      });

      this.removeToDoListBtn();
      this.editListBtnEvent();
      this.updateListBtnEvent();
      this.inlineEditHandlers();

      const event = new Event('listUpdated');
      document.dispatchEvent(event);
    };

    // add a task to a list
    static addLists = (description) => {
      const toDoLists = this.getToDoListFromStorage();
      const index = toDoLists.length + 1;
      const newtask = new DataList(description, false, index);

      toDoLists.push(newtask);
      this.addListToStorage(toDoLists);
      this.showLists();
    }

    // update to do list (save on Enter)
    static updateListBtnEvent = () => {
      document.querySelectorAll('.text').forEach((input) => input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          const inputListId = 'LIST';
          const ListIdSelected = event.currentTarget.id;
          let listID;

          if (!ListIdSelected.includes('LIST')) {
            listID = inputListId.concat(ListIdSelected);
          } else {
            listID = ListIdSelected;
          }

          const taskIndex = Number(listID.replace('LIST', ''));
          document.getElementById(listID).setAttribute('readonly', 'readonly');
          this.updateListByIndex(document.getElementById(listID).value, taskIndex);
        }
      }));
    }

    // inline editing: dblclick to edit, blur to save
    static inlineEditHandlers = () => {
      document.querySelectorAll('.text').forEach((input) => {
        input.addEventListener('dblclick', (e) => {
          const el = e.currentTarget;
          el.removeAttribute('readonly');
          el.focus();
          el.selectionStart = el.selectionEnd = el.value.length;
        });
        input.addEventListener('blur', (e) => {
          const el = e.currentTarget;
          const taskIndex = Number(el.id.replace('LIST', ''));
          el.setAttribute('readonly', 'readonly');
          this.updateListByIndex(el.value, taskIndex);
        });
      });
    }

    // edit list (kept for users who prefer the button)
    static editListBtnEvent = () => {
      let previousList = null;
      document.querySelectorAll('.edit_list_btn').forEach((button) => button.addEventListener('click', (event) => {
        event.preventDefault();
        const inputListId = 'LIST';
        const ListIdSelected = event.currentTarget.id;
        let listID;

        if (!ListIdSelected.includes('LIST')) {
          listID = inputListId.concat(ListIdSelected);
        } else {
          listID = ListIdSelected;
        }

        if (previousList !== null) {
          // no-op: previousList handling retained
        }

        const listItem = event.target.closest('li');
        previousList = listItem;
        const ulItem = event.target.closest('ul');

        listItem.style.background = 'rgb(230, 230, 184)';
        ulItem.style.background = 'rgb(230, 230, 184)';

        document.getElementById(listID).removeAttribute('readonly');
        document.getElementById(listID).focus();
        document.getElementById(listID).style.background = 'rgb(230, 230, 184)';
      }));
    };
}