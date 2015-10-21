/*
 * Alphascreen
 * (c) leandro@leandro.org
 * GPL v3 license
 * v. 20151020
 */
requirejs.config({
    appDir: ".",
    baseUrl: "js",
    paths: {
        'Zepto': ['zepto.min'],
        'underscore': ['underscore-min']
    },
    shim: {
        'underscore': {
            exports: '_',
            deps: ['Zepto']
        }
    }
});

require(["Zepto", 'underscore'], function(Zepto, _) {

    // basic vars
    var parent = $('#apps');
    var settings = $('#menu_settings');
    var iconMap = new WeakMap();

    /* CONFIG */

    var bg = true;
    var x = 2; //default icon columns key value
    var config = {};

    config.empty_letters = true;
    config.columns = [];
    config.columns[2] = 65;
    config.columns[3] = 35;
    // color tiles
    config.color_tile = null;
    config.pink_tile_bg  = "#f8b3f8";
    config.green_tile_bg = "#55AA55";
    config.big_tile_width = "108px";
    config.small_tile_width = "75px";
    // theme colors
    config.color_theme = [];
    config.color_theme['violet']= "-moz-linear-gradient(-45deg, violet, navy);";
    config.color_theme['green'] = "-moz-linear-gradient(-45deg, #2D882D, #116611);";
    config.selected_theme = 'violet';




    /* END CONFIG */

    var app_status = function(state_apps, state_settings) {
        parent.css('display', state_apps);
        settings.css('display', state_settings);
    }


    /**
     * Letters section generator
     */
    var print_letter = function(l) {
        var letter = document.createElement('div');
        letter.className = 'letter';
        letter.id = l;
        letter.innerHTML = "<div>" + l + "</div>";
        letter.setAttribute("name", l);
        parent.append(letter);
        if (config.empty_letters) {
            letter.style.display="none";
        }
    }

    /**
     * Renders the icon to the container.
     */
    var render = function(icon) {

        var name = icon.app.manifest.name;
        var wordname = name.split(" ");
        var firstchar = name.charAt(0);
        var tile_bg = ('violet' == config.selected_theme)? config.pink_tile_bg : config.green_tile_bg;

        /* tile generation*/
        var tile = document.createElement('div');
        tile.className = 'tile';
        tile.className += ' icon_' + wordname[0];
        var str_tile = (config.color_tile)? ", "+ tile_bg : "";
        tile.style.background = 'url(' + icon.icon + ') center/' + config.columns[x] + '% no-repeat' + str_tile;
        tile.style.width = (2 == x) ? config.big_tile_width : config.small_tile_width;
        if (3 == x) tile.style.height = config.small_tile_width;

        if (_.isEmpty($('.'+ 'icon_' + wordname[0])))  $('#' + firstchar).append(tile);
        if (config.empty_letters) {
            $('#' + firstchar).show(); //FIXME zepto show() is very slow :(
        }
        iconMap.set(tile, icon);
        /* end tile generation*/
    }

    /* fires up the painting */
    var start = function() {

            background = config.color_theme[config.selected_theme];


            //clean up to redraw
            $('.tile').remove();
            $('.letter').remove();
            // end clean up

            // draw section letters
            for (z = 65; z < 91; z++) { // old reliable for loop :)
                print_letter( String.fromCharCode(z) );
            }

            /**
             * Fetch all apps and render them.
             */

            FxosApps.all().then(icons => {
                icons.forEach(render);

            });


            //options buttons
            if (bg == true) {
                document.getElementById('btn_config__bg_transparent').disabled = false;
                document.getElementById('btn_config__bg_colored').disabled = true;
            }
            if (bg == false) {
                document.getElementById('btn_config__bg_transparent').disabled = true;
                document.getElementById('btn_config__bg_colored').disabled = false;
            }

            //theme
            if (config.selected_theme == "green") {
                document.getElementById('btn_config__green_theme').disabled = true;
                document.getElementById('btn_config__violet_theme').disabled = false;
            }
            if (config.selected_theme == "violet") {
                document.getElementById('btn_config__green_theme').disabled = false;
                document.getElementById('btn_config__violet_theme').disabled = true;
            } //end theme

            if (config.color_tile) {
                document.getElementById('btn_config__tile_transparent').disabled = false;
                document.getElementById('btn_config__tile_colored').disabled = true;
            }
            if (!config.color_tile) {
                document.getElementById('btn_config__tile_transparent').disabled = true;
                document.getElementById('btn_config__tile_colored').disabled = false;
            }

            if (config.empty_letters == true) {
                document.getElementById('btn_config__hide_empty_letters').disabled = true;
                document.getElementById('btn_config__show_empty_letters').disabled = false;
            }
            if (config.empty_letters == false) {
                document.getElementById('btn_config__show_empty_letters').disabled = true;
                document.getElementById('btn_config__hide_empty_letters').disabled = false;
            }

            if (2 == x) {
                document.getElementById('btn_config__icons_2_columns').disabled = true;
                document.getElementById('btn_config__icons_3_columns').disabled = false;
            }

            if (3 == x) {
                document.getElementById('btn_config__icons_2_columns').disabled = false;
                document.getElementById('btn_config__icons_3_columns').disabled = true;
            }
            // end options buttons

            app_status("block", "none");

        } //end start


    /**
     * Add an event listener to launch the app on click.
     */
    window.addEventListener('click', e => {
        var i = iconMap.get(e.target);
        if (i) i.launch();
        else {
            /*
            console.log(e);
            console.log(e.explicitOriginalTarget.data);
            */


            //TO-DO: a switch here, plz

            //cancel
            if (e.target.id == "btn_config__cancel") {
                app_status("block", "none");
            }

            //theme
            if (e.target.id == "btn_config__green_theme") {
                config.selected_theme = "green";
                parent.css('background', config.color_theme[config.selected_theme]);
                start();
            }

            if (e.target.id == "btn_config__violet_theme") {
                config.selected_theme = "violet";
                parent.css('background', config.color_theme[config.selected_theme]);
                start();
            }

            // background
            if (e.target.id == "btn_config__bg_transparent") {
                parent.css('background', 'none');
                bg = false;
                start();
            }

            if (e.target.id == "btn_config__bg_colored") {
                parent.css('background', config.color_theme[config.selected_theme]);
                bg = true;
                start();
            }// end background

            //tiles
            if (e.target.id == "btn_config__tile_transparent") {
                config.color_tile = null;
                start();
            }

            if (e.target.id == "btn_config__tile_colored") {
                config.color_tile = "#f8b3f8";
                start();
            }

            //letters
            if (e.target.id == "btn_config__hide_empty_letters") {
                config.empty_letters = true;
                start();
            }

            if (e.target.id == "btn_config__show_empty_letters") {
                config.empty_letters = false;
                start();
            }

            //columns
            if (e.target.id == "btn_config__icons_2_columns") {
                x = 2;
                start();
            }

            if (e.target.id == "btn_config__icons_3_columns") {
                x = 3;
                start();
            }

        }
    }); //end window event 'click'


    //settings longpress event
    window.addEventListener('contextmenu', function(){
        // hide/show disabled buttons in settings
        _.map($('button'), function(b){
            if (b.disabled) b.style.display="none";
            else b.style.display="block";
        });

        app_status("none", "block");
    }, true);
    //end settings event 'longpress'


    window.addEventListener ("scroll", function() {
        $('#scrollbar').css('marginTop',  $(window).scrollTop());
    });


    // 3, 2, 1 ...
    console.log(config.color_tile);
    start();

});
