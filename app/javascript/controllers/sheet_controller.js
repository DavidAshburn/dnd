import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = [
    //in order of appearance
    'langButton',
    'classSkillsButton',
    'charLevel',
    'charName',
    'profBonus',
    'passPerception',
    'strBase',
    'strMod',
    'strSavingThrowMod',
    'strSaveProf',
    'athleticsMod',
    'athleticsProf',
    'dexBase',
    'dexMod',
    'dexSavingThrowMod',
    'dexSaveProf',
    'acrobaticsMod',
    'acrobaticsProf',
    'sleightOfHandMod',
    'sleightOfHandProf',
    'stealthMod',
    'stealthProf',
    'conBase',
    'conMod',
    'conSavingThrowMod',
    'conSaveProf',
    'intBase',
    'intMod',
    'intSavingThrowMod',
    'intSaveProf',
    'arcanaMod',
    'arcanaProf',
    'historyMod',
    'historyProf',
    'investigationMod',
    'investigationProf',
    'natureMod',
    'natureProf',
    'religionMod',
    'religionProf',
    'wisBase',
    'wisMod',
    'wisSavingThrowMod',
    'wisSaveProf',
    'animalHandlingMod',
    'animalHandlingProf',
    'insightMod',
    'insightProf',
    'medicineMod',
    'medicineProf',
    'perceptionMod',
    'perceptionProf',
    'survivalMod',
    'survivalProf',
    'chaBase',
    'chaMod',
    'chaSavingThrowMod',
    'chaSaveProf',
    'deceptionMod',
    'deceptionProf',
    'intimidationMod',
    'intimidationProf',
    'performanceMod',
    'performanceProf',
    'persuasionMod',
    'persuasionProf',
    'aboutClass',
    'aboutSubclass',
    'aboutLevel',
    'aboutBackground',
    'aboutRace',
    'aboutSubrace',
    'aboutAlignment',
    'aboutExperiencePoints',
    'substatAC',
    'substatInitiative',
    'substatSpeed',
    'substatInspiration',
    'trackingMaxHP',
    'trackingCurrentHP',
    'trackingTemporaryHP',
    'trackingHitDice',
    'trackingDeathSaveSuccess',
    'trackingDeathSaveFailure',
    'featureList',
    'raceFeatures',
    'subraceFeatures',
    'classFeatures',
    'subclassFeatures',
    'backgroundFeatures',
    'raceSkills',
    'subraceSkills',
    'classSkills',
    'subclassSkills',
    'backgroundSkills',
    'featSkills',
    'raceLanguages',
    'extraLanguages',
    'subraceLanguages',
    'backgroundLanguages',
    'raceWeapons',
    'subraceWeapons',
    'classWeapons',
    'subclassWeapons',
    'backgroundWeapons',
    'raceArmor',
    'subraceArmor',
    'classArmor',
    'subclassArmor',
    'backgroundArmor',
    'raceTools',
    'subraceTools',
    'classTools',
    'subclassTools',
    'backgroundTools',
    'castingClass',
    'castingAbility',
    'castingSaveDC',
    'castingAttackBonus',
    'equipGP',
    'equipSP',
    'equipCP',
    'equipArmor',
    'dialogLanguages',
    'languageModalList',
    'langLimit',
    'dialogClassSkills',
    'classSkillsModalList',
    'classSkillsLimit',
  ];

  connect() {
    //we'll take over from the turbo frame and store the form data in a Map
    this.choices = new Map();
    this.choices.set('race', 'none');
    this.choices.set('subrace', 'none');
    this.choices.set('player_class', 'none');
    this.choices.set('subclass', 'none');
    this.choices.set('background', 'none');
    this.choices.set('level', 0);

    //variables set later but available as noted
    ///set on randomStats
    this.str;
    this.dex;
    this.con;
    this.int;
    this.wis;
    this.cha;
    ///set on statModUpdate
    this.stats;
    ///set on level update in catHandler
    this.prof_mod;
    ///set on class form select
    this.spellcasting_ability;

    //used for selection and updating
    this.skills = new Map(); //initialized later in setSkillMap()
    this.languages = this.blankCategoryMap();
    this.extra_languages = this.blankCategoryMap();
    this.tools = this.blankCategoryMap();
    this.weapons = this.blankCategoryMap();
    this.armor = this.blankCategoryMap();
    this.features = this.blankCategoryMap();
    this.classSkillChoices; //set in catUpdate
    this.numClassSkillChoices; //set in catUpdate

    //button colors
    this.disabled_color = 'bg-orange-300';
    this.active_color = 'bg-blue-400';

    //locking modals until their content is able to be populated
    this.langButtonTarget.disabled = true;
    this.classSkillsButtonTarget.disabled = true;
  }

  //----------------------------- Main Sheet Update Flow ---------------------------------//
  categoryHandler(event) {
    let labels = event.params;
    let list = event.target.children;
    this.updateChoices();

    if (event.target.id != 'level') {
      for (let i = 0; i < list.length; i++) {
        //list is an HTMLCollection
        if (list.item(i).selected) {
          let name = list.item(i).innerText;
          fetch(`${labels.url}${name}`)
            .then((response) => response.json())
            .then((data) => this.catUpdate(data, event.target.id));
        }
      }
    } else {
      this.catUpdate({}, event.target.id);
    }
  }

  catUpdate(data, cat_type) {
    //event.target.id is actually the :name param
    let languages, extra_lang, skills, weps, arm, tools, features;

    //Handle category specific behaviors here
    //we set these first variables so we can add and remove the correct items whenever a form select changes
    //the setters are just for things like Size or Spellcasting Stat that are unique to certain categories
    switch (cat_type) {
      case 'race':
        languages = this.raceLanguagesTarget;
        skills = this.raceSkillsTarget;
        weps = this.raceWeaponsTarget;
        arm = this.raceArmorTarget;
        tools = this.raceToolsTarget;
        features = this.raceFeaturesTarget;

        //setters
        this.aboutRaceTarget.innerText = data.name;
        this.sheet_race = data.name; //these are used by levelUpdate()
        this.substatSpeedTarget.innerText = data.speed;
        break;

      case 'subrace':
        languages = this.subraceLanguagesTarget;
        skills = this.subraceSkillsTarget;
        weps = this.subraceWeaponsTarget;
        arm = this.subraceArmorTarget;
        tools = this.subraceToolsTarget;
        features = this.subraceFeaturesTarget;

        //setters
        this.aboutSubraceTarget.innerText = data.name;
        this.sheet_subrace = data.name;
        break;

      case 'player_class':
        languages = this.classLanguagesTarget;
        skills = this.classSkillsTarget;
        weps = this.classWeaponsTarget;
        arm = this.classArmorTarget;
        tools = this.classToolsTarget;
        features = this.classFeaturesTarget;
        //features aren't an array so PutList breaks because it calls forEach on it
        //skills are a choice for class

        //setters
        this.aboutClassTarget.innerText = data.name;
        this.sheet_class = data.name;
        this.hit_die = data.hit_die;
        this.saving_throws = data.saving_throws;

        //the seed stores saving throw proficiencies as indexes to this array
        let primary_proficiencies = [
          this.strSaveProfTarget,
          this.dexSaveProfTarget,
          this.conSaveProfTarget,
          this.intSaveProfTarget,
          this.wisSaveProfTarget,
          this.chaSaveProfTarget,
        ];

        //this.saving_throws has indexes of primary_proficiences whose text we set to '+'
        for (let i = 0; i < this.saving_throws.length; i++) {
          let item = this.saving_throws[i];
          primary_proficiencies[item].innerText = '+';
        }

        //class skill options for modal
        this.classSkillChoices = data.skill_choices;
        this.numClassSkillChoices = data.num_skills;

        //spell statboxes
        if (data.spellcasting_ability) {
          this.spellcasting_ability = data.spellcasting_ability;
          this.castingAbilityTarget.innerText =
            this.spellcasting_ability;
        } else {
          this.castingAbilityTarget.innerText = 'none';
        }
        break;

      case 'subclass':
        languages = this.subclassLanguagesTarget;
        skills = this.subclassSkillsTarget;
        weps = this.subclassWeaponsTarget;
        arm = this.subclassArmorTarget;
        tools = this.subclassToolsTarget;
        features = this.subclassFeaturesTarget;

        //setters
        this.aboutSubclassTarget.innerText = data.name;
        this.sheet_subclass = data.name;
        break;

      case 'background':
        languages = null;
        skills = this.backgroundSkillsTarget;
        weps = this.backgroundWeaponsTarget;
        arm = this.backgroundArmorTarget;
        tools = this.backgroundToolsTarget;
        features = this.backgroundFeaturesTarget;

        //setters
        this.aboutBackgroundTarget.innerText = data.name;
        this.sheet_background = data.name;
        this.equipGPTarget.innerText = data.gold;
        break;

      case 'level':
        this.level = event.target.value;

        this.aboutLevelTarget.innerText = this.level;
        this.prof_mod = Math.ceil(this.level / 4) + 1;

        this.profBonusTarget.innerText = this.prof_mod;

      default:
        break;
    }
    if (cat_type != 'level') {
      this.populateCatAbilities(
        data,
        cat_type,
        languages,
        skills,
        weps,
        arm,
        tools,
        features
      );
    }
    //once the changed category has been updated on the sheet, we want to finish up if possible
    //this runs if choices is entirely filled out
    if (this.isChoicesFull() && this.str) {
      this.finalPass();
    }
  }

  updateChoices() {
    //we'll call this whenever there's a change in the top form to update the state object this.choices
    //iterator replaces forEach on Map objects
    let iterchoice = this.choices.entries();

    //there are 6 choices to make
    for (let i = 0; i < this.choices.size; i++) {
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
          this.choices.set(label, options.item(j).innerText);
      }
    }
  }

  populateCatAbilities(
    data,
    cat_type,
    languages,
    skills,
    weps,
    arm,
    tools,
    features
  ) {
    //not all categories have these so I'm defaulting to empty array
    //which will make putList fizzle out and do nothing
    let data_lang = data.languages || [];
    this.languages.set(cat_type, data_lang);
    let data_extra_lang = data.extra_languages || [];
    this.extra_languages.set(cat_type, data_extra_lang);

    let data_skills = data.skills || [];

    let data_weps = data.weapons || [];
    this.weapons.set(cat_type, data_skills);
    let data_arm = data.armor || [];
    this.armor.set(cat_type, data_skills);
    let data_tools = data.tools || [];
    this.tools.set(cat_type, data_skills);
    let data_features = data.features || [];
    this.features.set(cat_type, data_skills);

    //we output the needed <p></p> tags to the target defined in the case above
    this.putList(data, data_lang, languages);
    //extra languages populated after selecting from list
    //note extra languages from a category in features
    this.putList(data, data_weps, weps);
    this.putList(data, data_arm, arm);
    this.putList(data, data_tools, tools);

    if (cat_type != 'player_class') {
      //these are choices for a class
      this.putList(data, data_skills, skills);
      if (cat_type != 'subclass')
        this.putList(data, data_features, features);
    }
  }

  finalPass() {
    this.setSkillMap();
    this.populateSkillModifiers();

    this.passPerceptionTarget.innerText = this.calcMod(this.wis) + 10;

    this.substatInitiativeTarget.innerText =
      this.dexModTarget.innerText;

    if (!this.equipArmorTarget.hasChildNodes()) {
      this.substatACTarget.innerText = 10 + this.calcMod(this.dex);
    } else {
      console.log('armor equipped');
    }

    this.trackingHitDiceTarget.innerText = `${this.level}d${this.hit_die}`;

    //these spell stats rely on base stats and player_class
    let spell_mod;
    switch (this.spellcasting_ability) {
      case 'STR':
        spell_mod = this.calcMod(this.str);
        break;
      case 'DEX':
        spell_mod = this.calcMod(this.dex);
        break;
      case 'CON':
        spell_mod = this.calcMod(this.con);
        break;
      case 'INT':
        spell_mod = this.calcMod(this.int);
        break;
      case 'WIS':
        spell_mod = this.calcMod(this.wis);
        break;
      case 'CHA':
        spell_mod = this.calcMod(this.cha);
        break;
      default:
        spell_mod = 0;
        break;
    }
    if (spell_mod != 0) {
      let bonus = spell_mod + this.prof_mod;
      this.castingSaveDCTarget.innerText = bonus + 8;
      this.castingAttackBonusTarget.innerText = bonus;
    }

    //activate buttons
    this.activateButtons();

    this.makeModalChoices();

    //at end of base calculations we should apply custom methods brought in by categories
    //e.g. the Barbarian Unarmored Defense
    this.customModifiers(); //tbw
  }

  //----------------------------- Final Pass methods ---------------------------------//
  setSkillMap() {
    this.skills.set('Athletics', [
      this.str,
      this.athleticsModTarget,
      this.athleticsProfTarget,
      '',
    ]);
    this.skills.set('Acrobatics', [
      this.dex,
      this.acrobaticsModTarget,
      this.acrobaticsProfTarget,
      '',
    ]);
    this.skills.set('Sleight of Hand', [
      this.dex,
      this.sleightOfHandModTarget,
      this.sleightOfHandProfTarget,
      '',
    ]);
    this.skills.set('Stealth', [
      this.dex,
      this.stealthModTarget,
      this.stealthProfTarget,
      '',
    ]);
    this.skills.set('Arcana', [
      this.int,
      this.arcanaModTarget,
      this.arcanaProfTarget,
      '',
    ]);
    this.skills.set('History', [
      this.int,
      this.historyModTarget,
      this.historyProfTarget,
      '',
    ]);
    this.skills.set('Investigation', [
      this.int,
      this.investigationModTarget,
      this.investigationProfTarget,
      '',
    ]);
    this.skills.set('Nature', [
      this.int,
      this.natureModTarget,
      this.natureProfTarget,
      '',
    ]);
    this.skills.set('Religion', [
      this.int,
      this.religionModTarget,
      this.religionProfTarget,
      '',
    ]);
    this.skills.set('Animal Handling', [
      this.wis,
      this.animalHandlingModTarget,
      this.animalHandlingProfTarget,
      '',
    ]);
    this.skills.set('Insight', [
      this.wis,
      this.insightModTarget,
      this.insightProfTarget,
      '',
    ]);
    this.skills.set('Medicine', [
      this.wis,
      this.medicineModTarget,
      this.medicineProfTarget,
      '',
    ]);
    this.skills.set('Perception', [
      this.wis,
      this.perceptionModTarget,
      this.perceptionProfTarget,
      '',
    ]);
    this.skills.set('Survival', [
      this.wis,
      this.survivalModTarget,
      this.survivalProfTarget,
      '',
    ]);
    this.skills.set('Deception', [
      this.cha,
      this.deceptionModTarget,
      this.deceptionProfTarget,
      '',
    ]);
    this.skills.set('Intimidation', [
      this.cha,
      this.intimidationModTarget,
      this.intimidationProfTarget,
      '',
    ]);
    this.skills.set('Performance', [
      this.cha,
      this.performanceModTarget,
      this.performanceProfTarget,
      '',
    ]);
    this.skills.set('Persuasion', [
      this.cha,
      this.persuasionModTarget,
      this.persuasionProfTarget,
      '',
    ]);
  }

  populateSkillModifiers() {
    //the class saving throws are stored as indexes to the bonus array so we go through
    //all this to assign 6 values possible bonuses from a db model then output to 6 different targets
    let save_modifiers = [
      this.strSavingThrowModTarget,
      this.dexSavingThrowModTarget,
      this.conSavingThrowModTarget,
      this.intSavingThrowModTarget,
      this.wisSavingThrowModTarget,
      this.chaSavingThrowModTarget,
    ];

    let bonuses = [0, 0, 0, 0, 0, 0];
    this.saving_throws.forEach((item) => {
      bonuses[item] += this.prof_mod;
    });
    for (let i = 0; i < 6; i++) {
      save_modifiers[i].innerText =
        bonuses[i] + this.calcMod(this.stats[i]);
    }

    //loop through the skills Map iterator and call updateSkill
    let skilliter = this.skills.values();
    for (let i = 0; i < this.skills.size; i++) {
      let value = skilliter.next().value;
      this.updateSkill(value[0], value[2], value[1], this.prof_mod);
    }
  }

  updateSkill(base_stat, profTarget, modTarget, prof_mod) {
    let bonus = this.calcMod(base_stat);
    if (profTarget.innerText == '+') bonus += prof_mod;
    if (profTarget.innerText == 'E') bonus += prof_mod * 2;
    modTarget.innerText = bonus;
  }

  //----------------------------- Choice Modals ---------------------------------//
  makeModalChoices() {
    this.chooseLanguages();
    this.chooseClassSkills();
    /* what choices are there?
      Race
        tool_choice

      Subrace
        extra_languages

      Class
        skill_choices
          num_skills
        equipment_choices

      Subclass
        custom choices = this might be tough to generalize

      Background
        TBIF
        languages [int]
    */
  }

  chooseLanguages() {
    let allLanguages = [
      'Common',
      'Elvish',
      'Dwarvish',
      'Giant',
      'Gnomish',
      'Goblin',
      'Halfling',
      'Orc',
      'Abyssal',
      'Celestial',
      'Draconic',
      'Deep Speech',
      'Infernal',
      'Primordial',
      'Sylvan',
      'Tabaxi',
      'Undercommon',
    ];

    this.removeAllChildNodes(this.languageModalListTarget);

    var list = [];
    this.raceLanguagesTarget.childNodes.forEach((node) => {
      let text = node.innerText;
      if (text.slice(-1) != ':') list.push(text); //this eliminates labels like Dwarf:
    });
    this.subraceLanguagesTarget.childNodes.forEach((node) => {
      let text = node.innerText;
      if (text.slice(-1) != ':') list.push(text);
    });

    let options = allLanguages.filter(
      (lang) => list.indexOf(lang) === -1
    );

    let init = 0;
    let temp;
    let lang_iter = this.extra_languages.values();
    for (let i = 0; i < this.extra_languages.size; i++) {
      temp = lang_iter.next().value;
      if (typeof temp === 'string') init += parseInt(temp);
    }

    this.langLimitTarget.innerText = `Choose ${init}`;

    this.populateListModal(this.languageModalListTarget, options); //this will populate the <ul> with checkboxes
    //onsubmit we'll validate the number chosen, and put the chosen ones into their own div
    //when backgrounds change we can empty that div and start over
  }

  submitLanguageChoices(event) {
    this.removeAllChildNodes(this.extraLanguagesTarget);
    //we clear the output here, all we have to do is limit the number of boxes you can check

    let chosen = [];
    this.languageModalListTarget.childNodes.forEach((node) => {
      if (node.firstChild.checked) {
        chosen.push(node.firstChild.value);
      }
    });
    if (
      chosen.length ==
      parseInt(this.langLimitTarget.innerText.slice(-1))
    ) {
      this.putModalChecksToSheet(chosen, this.extraLanguagesTarget);
      event.target.parentNode.close();
    }
  }

  chooseClassSkills() {
    //this.classSkillChoices is our all_languages equivalent
    //the only filtering we will do is cosmetic
    //show skills already defaulted in gray but allow selection for now

    let skillSources = [
      this.raceSkillsTarget,
      this.subraceSkillsTarget,
      this.classSkillsTarget,
      this.subclassSkillsTarget,
      this.backgroundSkillsTarget,
      this.featSkillsTarget,
    ];

    this.removeAllChildNodes(this.classSkillsModalListTarget);

    let taken_skills = [];

    skillSources.forEach((target) => {
      target.childNodes.forEach((node) => {
        let text = node.innerText;
        if (text.slice(-1) != ':') taken_skills.push(text);
      });
    });

    this.classSkillsLimitTarget.innerText = `Choose ${this.numClassSkillChoices}`;

    this.populateListModal(
      this.classSkillsModalListTarget,
      this.classSkillChoices
    );
  }

  submitClassSkillsChoices(event) {
    this.removeAllChildNodes(this.classSkillsTarget);
    let classname = this.choices.get('player_class');
    let chosen = [];
    this.classSkillsModalListTarget.childNodes.forEach((node) => {
      if (node.firstChild.checked) {
        chosen.push(node.firstChild.value);
      }
    });
    if (
      chosen.length ==
      parseInt(this.classSkillsLimitTarget.innerText.slice(-1))
    ) {
      this.putModalChecksToSheet(
        chosen,
        this.classSkillsTarget,
        classname
      );
      event.target.parentNode.close();
    }
  }

  populateListModal(target, options) {
    options.forEach((option) => {
      let container = document.createElement('div');
      container.class = 'flex flex-col gap-2 p-2';

      let check = document.createElement('input');
      check.type = 'checkbox';
      check.value = option;

      container.append(check);
      container.append(option);

      target.appendChild(container);
    });
  }

  //add new choice buttons to the target list to activate them in finalPass
  activateButtons() {
    let buttons = [
      this.langButtonTarget,
      this.classSkillsButtonTarget,
    ];

    buttons.forEach((button) => {
      button.disabled = false;
      button.classList.remove(this.disabled_color);
      button.classList.add(this.active_color);
    });
  }

  //----------------------------- Base Stat Methods ---------------------------------//
  statModUpdate() {
    this.strModTarget.innerText = this.modWithSign(
      this.calcMod(this.str)
    );
    this.dexModTarget.innerText = this.modWithSign(
      this.calcMod(this.dex)
    );
    this.conModTarget.innerText = this.modWithSign(
      this.calcMod(this.con)
    );
    this.intModTarget.innerText = this.modWithSign(
      this.calcMod(this.int)
    );
    this.wisModTarget.innerText = this.modWithSign(
      this.calcMod(this.wis)
    );
    this.chaModTarget.innerText = this.modWithSign(
      this.calcMod(this.cha)
    );

    this.stats = [
      this.str,
      this.dex,
      this.con,
      this.int,
      this.wis,
      this.cha,
    ];
    if (this.isChoicesFull() && this.str) {
      this.finalPass();
    }
  }

  randomStats() {
    this.str = Math.floor(Math.random() * 20) + 1;
    this.strBaseTarget.innerText = this.str;
    this.con = Math.floor(Math.random() * 20) + 1;
    this.conBaseTarget.innerText = this.con;
    this.dex = Math.floor(Math.random() * 20) + 1;
    this.dexBaseTarget.innerText = this.dex;
    this.int = Math.floor(Math.random() * 20) + 1;
    this.intBaseTarget.innerText = this.int;
    this.cha = Math.floor(Math.random() * 20) + 1;
    this.chaBaseTarget.innerText = this.cha;
    this.wis = Math.floor(Math.random() * 20) + 1;
    this.wisBaseTarget.innerText = this.wis;

    this.statModUpdate();
  }

  //----------------------------- Custom entry Handling ---------------------------------//

  customModifiers() {} //tbw

  //----------------------------- Utility Methods ---------------------------------//

  putList(category, collection, target) {
    //creates p tags for collection and appends list to target with label for category name
    //clears allChildfren of Target before appending so I use it in specific labele
    //we pass in a category instance, collection within it, and output target
    //if the collection is empty, the function returns without side-effects

    if (collection.length == 0 || target == null) return;

    this.removeAllChildNodes(target);

    target.append(this.getPTag(category.name, 'font-bold'));
    collection.forEach((item) => {
      let l_item = document.createElement('p');
      l_item.append(item);
      target.append(l_item);
    });
  }

  putModalChecksToSheet(collection, target, name = '') {
    //creates p tags for collection and appends list to target with label for category name
    //clears allChildfren of Target before appending so I use it in specific labele
    //we pass in a category instance, collection within it, and output target
    //if the collection is empty, the function returns without side-effects

    if (collection.length == 0 || target == null) return;

    this.removeAllChildNodes(target);

    if (name != '') {
      let tag = document.createElement('p');
      tag.classList.add('font-bold');
      tag.append(`${name}: `);
      target.append(tag);
    }

    collection.forEach((item) => {
      let l_item = document.createElement('p');
      l_item.append(item);
      target.append(l_item);
    });
  }

  removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  modWithSign(val) {
    let sign;
    if (val == 0) return '0';
    if (val < 0) return `${val}`;
    return `+${val}`;
  }

  //got some styling hiding out in here with the the font-medium
  getPTag(string, font_weight = 'font-medium') {
    let out = document.createElement('p');
    out.classList.add(font_weight);
    out.append(string + ':');
    return out;
  }

  //calculate modifier
  calcMod(base) {
    return Math.floor(base / 2) - 5;
  }

  isChoicesFull() {
    let checklist = this.choices?.values();
    for (let i = 0; i < this.choices.size; i++) {
      let val = checklist.next().value;
      if (val == 'none' || val == 0) {
        return false;
      }
    }
    return true;
  }

  logMap(mymap) {
    console.log('logMap');
    let iter = mymap.entries();
    for (let i = 0; i < mymap.size; i++) {
      console.log(iter.next().value);
    }
    console.log('logged map');
  }

  //returns a Map { category_names, [] }
  blankCategoryMap() {
    let categories = new Map();
    categories.set('race', []);
    categories.set('subrace', []);
    categories.set('player_class', []);
    categories.set('subclass', []);
    categories.set('background', []);
    categories.set('feats', []);
    return categories;
  }

  //Modal display activation
  showLangDialog() {
    this.dialogLanguagesTarget.showModal();
  }

  showClassSkillsDialog() {
    this.dialogClassSkillsTarget.showModal();
  }
}
