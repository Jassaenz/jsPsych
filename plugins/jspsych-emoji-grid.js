pycp/**
 * jspsych-emoji-grid
 * Jasmine
 *
 * plugin for displaying a canvas (emoji grid image) and recording mouseclick response
 *
 **/


//question! Do I need a mouseclick as a parameter type?

jsPsych.plugins["emoji-grid"] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'emoji-grid',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The drawing function to apply to the canvas. Should take the canvas object as argument.'
      },
      image: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Image',
        default: undefined,
        description: 'The image to render onto the canvas'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: "Any content here will be displayed under the image"
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: "How long to show the stimulus"
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: "How long to show trial before the end"
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: "if true, trial ends when subject makes response"
      },
      canvas_size: {
        type: jsPsych.plugins.parameterType.INT,
        array: true
        pretty_name: "Canvas size"
        default: [707, 747],
        description: 'Array containing the height (first value) and width (second value) of canvas element'
      },
    }
  }



  plugin.trial = function (display_element, trial) {

    //make a canvas
    var new_html = '<canvas id="jspsych-canvas-stimulus" height="' + trial.canvas_size[0] + '"width="' + trial.canvas_size[1] + '"></canvas>';
    //add prompt
    if (trial.prompt!== null){
      new_html += trial.prompt;
    };

    //render img onto our canvas
    function draw() {
      const ctx = document.getElementById("jspsych-canvas-stimulus").getContext("2d");
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = "EmojiGrid.jpg";
    };
    
    draw();

    //start time
    var start_time = performance.now();

    //draw, add listener event to canvas
    let canvasElem = document.querySelector("jspsych-canvas-stimulus");
    trial.stimulus(canvasElem)

// chatgpt aided below
    canvas.addEventListener("click", (event) => {
      const rect = canvas.GetBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const response = {
        x: x, 
        y: y,
      };


    canvasElem.addEventListener("mousedown", function (e) {
      getMousePosition(canvasElem, e);
    });

    //store response
    //HOW IN THE WORLD DO I STORE THE COORDINATES THAT WENT TO THE CONSOLE?
    var response = {
      rt: null,
      x: null,
      y: null
    };

    //function to handle responses by subject
    function after_response(x, y) {
      // measure rt
      var end_time = performance.now();
      var rt = end_time - start_time;
      //response.click = parseInt(console.log); UHHHH WHAT WOULD I PUT HERE??/
      response.rt = rt;      
    }





    // end trial
    jsPsych.finishTrial(trial_data);
  };

  return plugin;
})();


//do i need to create a variable to store coordinates? an object? Do x and y suffice?







