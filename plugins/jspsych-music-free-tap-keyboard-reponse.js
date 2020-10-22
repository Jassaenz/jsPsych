/**
 * jspsych-music-free-tap-keyboard-reponse.js
 * Benjamin Kubit 18Oct2020
 *
 * plugin for auditory target detection task with tone bleeps while auditory stim is playing in the background
 *
 * 
 *
 **/


jsPsych.plugins["music-free-tap-keyboard-reponse"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('music-free-tap-keyboard-reponse', 'stimulus', 'audio');

  plugin.info = {
    name: 'music-free-tap-keyboard-reponse',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.AUDIO,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The audio to be played.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Choices',
        array: true,
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, the trial will end when user makes a response.'
      },
      trial_ends_after_audio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Trial ends after audio',
        default: false,
        description: 'If true, then the trial will end as soon as the audio file finishes playing.'
      },
      add_fixation: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Add Fixation cross',
        default: false,
        description: 'If true, displays fixation cross'
      },
      fix_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Dimensions of fixation cross',
        default: 40,
        description: 'Hieght and width of fixation cross.'
      },
      vtarg_grid_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Vtarg grid width',
        default: 800,
        description: 'Total width of target grid.'
      },
      vtarg_grid_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Vtarg grid height',
        default: 800,
        description: 'Total height of target grid.'
      },
      timeConvert: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Event and Response time conversion',
        default: 1000,
        description: 'Number to multiply time values by (1000 = ms).'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // setup stimulus
    var context = jsPsych.pluginAPI.audioContext();
    if(context !== null){
      var source = context.createBufferSource();
      source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      source.connect(context.destination);

    } else {
      var audio = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      audio.currentTime = 0;
    }

    // show prompt if there is one
    if (trial.prompt !== null) {
      display_element.innerHTML = trial.prompt;
    }

    // set up end event if trial needs it
    if(trial.trial_ends_after_audio){
      if(context !== null){
        source.onended = function() {
          end_trial();
        }
      } else {
        audio.addEventListener('ended', end_trial);
      }
    }

    // store response
    var run_events = [];

    var response_data = {
        time: null,
        type: null,
        stimulus: null,
        key_press: null,
        ITI: null
    };

    var response = {
      rt: null,
      key: null
    };

    var prev_tap_time = 0;

    // set up the vtarg grid
    // NOTE, seems to be required to feed into display_element.innerHTML
    var svgns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgns, "svg");
    $(svg).attr({"width": trial.vtarg_grid_width, "height": trial.vtarg_grid_height});
    $("#svgdiv").append(svg);


    if(trial.add_fixation==true){
      var dpathval = 'M'+(trial.vtarg_grid_width/2)+','+(trial.vtarg_grid_height/2-(trial.fix_height/2))+' V'+(trial.vtarg_grid_height/2+trial.fix_height/2)+' M'+(trial.vtarg_grid_height/2-(trial.fix_height/2))+','+(trial.vtarg_grid_height/2)+' H'+(trial.vtarg_grid_height/2+trial.fix_height/2);
      //dpathval = 'M'+(400)+','+(400-20)+' V'+(400-20+40)+' M'+(400-20)+','+(400)+' H'+(400-20+40)
      var fixp = document.createElementNS(svgns,'path');
      $(fixp).attr({'id':'fixation','d':dpathval,'stroke':'gray','fill':'gray','stroke-width':3,'opacity':1});
      $(svg).append(fixp);
    }

    // function to end trial when it is time
    function end_trial() {
      // kill any remaining setTimeout handlers (including vtargs)
      jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if(context !== null){
        source.stop();
        source.onended = function() { }
      } else {
        audio.pause();
        audio.removeEventListener('ended', end_trial);
      }

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(run_events);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      response = info;

      //append this info to current trial_data
      response_data.stimulus = trial.stimulus.replace(/^.*[\\\/]/, '');
      response_data.time = Math.round(response.rt * trial.timeConvert);
      response_data.key_press = response.key;
      response_data.type = 'response';
      response_data.ITI = response_data.time-prev_tap_time;//inter-tap-interval
     
      run_events.push(response_data);

      prev_tap_time = response_data.time;

      response_data = {
        time: null,
        type: null,
        stimulus: null,
        key_press: null,
        ITI: null
      };

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // Embed the rest of the trial into a function so that we can attach to a button if desired
    var start_audio = function(){
      if(context !== null){
        context.resume(); 
        startTime = context.currentTime;
        source.start(startTime);
        
      } else {
        audio.play();
      }

      // start the response listener
      if(context !== null) {
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: 'audio',
          persist: true,
          allow_held_key: false,
          audio_context: context,
          audio_context_start_time: startTime
        });
      } else {
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: 'performance',
          persist: true,
          allow_held_key: false
        });
      }

      // end trial if time limit is set
      if(trial.trial_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function() {
          end_trial();
        }, trial.trial_duration); 
      }

      display_element.innerHTML = svg.outerHTML;
    };

    // Either start the trial or wait for the user to click start
    if(!trial.click_to_start || context==null){
      start_audio();
    } else {
      // Register callback for start sound button if we have one
      $('#start_button').on('click', function(ev){
        ev.preventDefault();
        start_audio();
      })
    }
  };

  return plugin;
})();