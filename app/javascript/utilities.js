//-------------------------------------------pure state modifiers
//modifies a given stat and returns new stat array
export function increaseStat(stat_list, stat, val = 1) {
  switch (stat) {
    case 'STR':
      stat_list[0] += val;
      break;
    case 'CON':
      stat_list[2] += val;
      break;
    case 'DEX':
      stat_list[1] += val;
      break;
    case 'INT':
      stat_list[3] += val;
      break;
    case 'WIS':
      stat_list[4] += val;
      break;
    case 'CHA':
      stat_list[5] += val;
      break;
    default:
      return 'NaS';
  }
  return stat_list;
}

//-------------------------------------------impure state modifiers
//loops through this.stats and recalculates based on base_stats, raceASI, and subraceASI
export function calculateStats(stats, base, race, subrace) {
  let index = 0;
  for (let item of stats) {
    stats[index] = base[index] + race[index] + subrace[index];
    index++;
  }
}

//-------------------------------------------helpers
//validates turbo form select boxes for finalPass
export function isChoicesFull(list) {
  let checklist = list.values();
  for (let i = 0; i < list.size; i++) {
    let val = checklist.next().value;
    if (val == 'none' || val == 0) {
      return false;
    }
  }
  return true;
}

//runs in categoryHandler and checks values of turbo frame form selects,
//updates this.choices to reflect user selections
export function updateChoices(choices) {
  //we'll call this whenever there's a change in the top form to update the state object choices
  let iterchoice = choices.entries();

  //there are 6 choices to make
  for (let i = 0; i < choices.size; i++) {
    //we get the options for each form select in an HTMLCollection
    let label = iterchoice.next().value[0];
    let options = document.getElementById(label).children;

    //we have to use set and item to deal with the HTMLCollection
    //we won't set anything that is still on the label '- Whatever -'
    for (let j = 0; j < options.length; j++) {
      if (
        options.item(j).selected &&
        options.item(j).innerText.charAt(0) != '-'
      )
        choices.set(label, options.item(j).innerText);
    }
  }
}

//just sets innertext on the sheet to match current stats after stats change
export function updateStats(targets, stats) {
  for (let i = 0; i < 6; i++) {
    targets[i].innerText = stats[i];
  }
}

//input two arrays, if the second is contained in the first as an entry return true, else false
export function subarrayMatch(list, sublist) {
  let flag;
  for (let item of list) {
    if (item.length == sublist.length) {
      flag = true;
      for (let i = 0; i < item.length; i++) {
        if (item[i] != sublist[i]) flag = false;
      }
      if (flag) return true;
    }
  }
  return false;
}

//-------------------------------------------modal utilities

//put a select teg to the given target
export function putSelect(title, options, target) {
  let select = getTag('select', 'rounded-md');
  select.append(getTag('option', '', title));
  for (let item of options) {
    let option = getTag('option', '', item);
    option.value = item;
    select.append(option);
  }
  target.append(select);
}

//fetch data and populate weapon select based on given type
export function appendWeaponSelectToTarget(wep_type, target) {
  let selector = getTag('select', 'rounded-md');
  //selector.id = 'testing';

  let plate_title =
    wep_type.charAt(0).toUpperCase() + wep_type.slice(1) + ' Weapon';
  let plate = getTag('option', '', `- ${plate_title} -`);

  selector.append(plate);

  fetch(`/weapons/${wep_type}`)
    .then((response) => response.json())
    .then((data) => {
      data.forEach((item) => {
        let option = getTag('option', '', item['name']);
        option.value = item['name'];
        selector.append(option);
      });
      target.append(selector);
    });
}

//make sure only one checkbox in the given row is selected
export function validateEquipmentRow(row) {
  let row_output;

  let count = 0;

  for (let choice_box of row.children) {
    if (choice_box.firstChild.checked) {
      count++;
      row_output = choice_box.lastChild;
    }
  }
  if (count != 1) {
    return false;
  }

  let validated_output = [];
  for (let item of row_output.children) {
    if (item.tagName == 'SELECT') {
      let text = item.value;
      validated_output.push(text);
    } else {
      validated_output.push(item.innerText);
    }
  }

  return validated_output;
}

//add new choice buttons to the target list in connect()
export function activateButtons(buttons, act_color, dis_color) {
  buttons.forEach((button) => {
    button.disabled = false;
    button.classList.remove(dis_color);
    button.classList.add(act_color);
  });
}

export function activateButton(target, act_color, dis_color) {
  target.disabled = false;
  target.classList.remove(dis_color);
  target.classList.add(act_color);
}

export function deactivateButton(target, act_color, dis_color) {
  target.disabled = true;
  target.classList.remove(act_color);
  target.classList.add(dis_color);
}

//-------------------------------------------object instantiation
//returns a Map { ...category_names, [] }
export function blankCategoryMap() {
  let categories = new Map();
  categories.set('race', []);
  categories.set('subrace', []);
  categories.set('player_class', []);
  categories.set('subclass', []);
  categories.set('background', []);
  categories.set('feats', []);
  return categories;
}

//-------------------------------------------DOM manipulation
//return a new DOM element with given tag, classname, and content
export function getTag(string, classname, content) {
  let out = document.createElement(string);
  out.className = classname;
  if (content) out.append(content);
  return out;
}

//supports simple and martial for now
//testing instrument, backpack, focus, artisan

//type == string, select box will be appended to sel_target async
export function getSelect(type, sel_target) {
  let selector = getTag('select', 'rounded-md');

  let plate_title;
  let fetch_prefix;
  //set our fetch routes and titles
  switch(type) {
    case 'simple':
      plate_title = type.charAt(0).toUpperCase() + type.slice(1) + ' Weapon';
      fetch_prefix = '/weapons/';
      break;
    case 'martial':
      plate_title = type.charAt(0).toUpperCase() + type.slice(1) + ' Weapon';
      fetch_prefix = '/weapons/';
      break;
    case 'instrument':
      plate_title = type.charAt(0).toUpperCase() + type.slice(1);
      fetch_prefix = '/labels/';
      break;
    case 'gearpack':
      plate_title = 'Backpack';
      fetch_prefix = '/labels/';
      break;
    case 'artisan':
      plate_title = "Artisan's Tools";
      fetch_prefix = '/labels/';
      break;
    default:
      'select pop error';
      break;
  }
  
  let plate = getTag('option', '', `- ${plate_title} -`);
  selector.append(plate);

  fetch( fetch_prefix + type )
    .then((response) => response.json())
    .then((data) => {
      data.forEach((item) => {
        let option = getTag('option', '', item['name']);
        option.value = item['name'];
        selector.append(option);
      });
      sel_target.append(selector);
    });
}

//empty an Element of children
export function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

//-------------------------------------------Sheet Update Helpers
//from populateCatAbilites
export function putClassFeatures(name, collection, target) {
  //creates p tags for collection and appends list to target with label for category name
  //clears allChildfren of Target before appending so I use it in specific labele
  //we pass in a category instance, collection within it, and output target
  //we check for the empty collections that popCatAbilities will send in regularly

  if (collection.length == 0 || target == null) return;
  //modified from above
  removeAllChildNodes(target);

  target.append(
    getTag('p', 'font-black col-span-2 text-center mt-2', name)
  );
  collection.forEach((item) => {
    //bold the feature label if it exists
    if (item.includes(':')) {
      let split = item.split(':');
      let title = getTag('p', 'font-semibold', split[0] + ':');
      let l_item = getTag('p', '', split[1]);
      target.append(title);
      target.append(l_item);
    } else {
      target.append(getTag('p', 'text-center', item));
    }
  });
}

//used on modal submission to output the selected items to the appropriate sheet targets
export function putModalChecksToSheet(collection, target, name = '') {
  //creates p tags for collection and appends list to target with optional 'name'

  //if the collection is empty, the function exits

  if (collection.length == 0 || target == null) return;

  removeAllChildNodes(target);

  if (name != '') {
    target.append(
      getTag('p', 'font-black col-span-2 text-center mt-2', name)
    );
  }

  collection.forEach((item) => {
    //bold the feature label if it exists
    if (item.includes(':')) {
      let split = item.split(':');
      let title = getTag('p', 'font-semibold', split[0] + ':');
      let l_item = getTag('p', '', split[1]);
      target.append(title);
      target.append(l_item);
    } else {
      target.append(getTag('p', 'text-center', item));
    }
  });
}

export function putRacialASI(list, target) {
  let stats = [
    'Strength',
    'Dexterity',
    'Constitution',
    'Intelligence',
    'Wisdom',
    'Charisma',
  ];
  for (let i = 0; i < 6; i++) {
    if (list[i] > 0) {
      target.append(
        getTag('p', 'text-center', `+${list[i]} ${stats[i]}`)
      );
    }
  }
}

export function getSpellCard(source, stat, spells) {
  let box = getTag(
    'div',
    'flex flex-col md:flex-row gap-2 p-4 rounded-lg border border-black bg-blue-300/50 text-sm'
  );
  let info = getTag(
    'div',
    'border border-black rounded-lg flex flex-col justify-center items-center gap-1 p-2'
  );

  info.append(getTag('p', 'font-black', source));
  info.append(getTag('p', 'font-black text-sm', stat));

  box.append(info);

  let list = getTag(
    'div',
    'border border-black rounded-lg grid grid-cols-2 gap-4 p-2'
  );
  
  let cast_type = "";
  for (let spell of spells) {
    switch(spell[1]) {
      case 'Normal':
        cast_type = '';
        break;
      default:
        cast_type = '- ' + spell[1];
        break;
    }
    list.append(getTag('p', '', `${spell[0]} ${cast_type}`));
  }
  box.append(list);
  return box;
}

export function putDiceCustomPane(title, limit, size, target) {
  let frame = getTag('div','flex flex-col text-center gap-2 p-2 bg-blue-400/50 rounded-sm border-2 border-blue-500');
  let titlepane = getTag('h4','font-black w-full mx-4 rounded-lg',title);
  let die = getTag('p','',`${limit}d${size}`);
  frame.append(titlepane);
  frame.append(die);
  target.append(frame);
}

export function putPointsCustomPane(title, limit, target) {
  let frame = getTag('div','flex flex-col text-center gap-2 p-2 bg-blue-400/50 rounded-sm border-2 border-blue-500');
  let titlepane = getTag('h4','font-black w-full mx-4 rounded-lg',title);
  let die = getTag('p','',`${limit}`);
  frame.append(titlepane);
  frame.append(die);
  target.append(frame);
}
//---populate
/*
  'specialties'=> {
    'title'=> 'Maneuvers',
    'limits'=> [
      [1,3],
      [5,4],
      [7,5],
      [14,7]
    ],
    'list'=> [['name','description'],['',''],['',''],],
  }
*/

//------------------------------------------- little helpers
//calculate skill modifier
export function calcMod(base) {
  return Math.floor(base / 2) - 5;
}

//return int as string with + or - sign
export function modWithSign(val) {
  if (val > 0) return `+${val}`;
  return `${val}`;
}

//turn STR into Strength
export function expandStatName(stat) {
  switch (stat) {
    case 'STR':
      return 'Strength';
    case 'CON':
      return 'Constitution';
    case 'DEX':
      return 'Dexterity';
    case 'INT':
      return 'Intelligence';
    case 'WIS':
      return 'Wisdom';
    case 'CHA':
      return 'Charisma';
    default:
      return 'NaS';
  }
}

export function capitalize(string) {
  let first = string.charAt(0).toUpperCase();
  return first + string.slice(1);
}