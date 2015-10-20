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

        /* tile generation*/
        var tile = document.createElement('div');
        tile.className = 'tile';
        tile.className += ' icon_' + wordname[0];
        tile.style.background = 'url(' + icon.icon + ') center/' + config.columns[x] + '% no-repeat';
        tile.style.width = (2 == x) ? "125px" : "95px";

        if (_.isEmpty($('.'+ 'icon_' + wordname[0])))  $('#' + firstchar).append(tile);
        if (config.empty_letters) {
            $('#' + firstchar).show(); //FIXME zepto show() is very slow :(
        }
        iconMap.set(tile, icon);
        /* end tile generation*/
    }

    /* fires up the painting */
    var start = function() {

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
            if (e.target.id == "btn_config__cancel") {
                app_status("block", "none");
            }

            // background
            if (e.target.id == "btn_config__bg_transparent") {
                parent.css('background','none');
                bg = false;
                start();
            }

            if (e.target.id == "btn_config__bg_colored") {
                parent.css('background','-moz-linear-gradient(-45deg, violet,navy)');
                bg = true;
                start();
            }// end background


            if (e.target.id == "btn_config__hide_empty_letters") {
                config.empty_letters = true;
                start();
            }

            if (e.target.id == "btn_config__show_empty_letters") {
                config.empty_letters = false;
                start();
            }

            if (e.target.id == "btn_config__icons_2_columns") {
                x = 2;
                start();
            }

            if (e.target.id == "btn_config__icons_3_columns") {
                x = 3;
                start();
            }

            // scrollbar
            if ( e.explicitOriginalTarget.data != undefined ) {
                if ( $('#' +e.explicitOriginalTarget.data).offset().top ) {
                    var letter_offset = $('#' +e.explicitOriginalTarget.data).offset().top;

                    $('#scrollbar').css('marginTop', letter_offset);
                }

            }
        }
    }); //end window event 'click'


    //settings longpress event
    window.addEventListener('contextmenu', function(){
        app_status("none", "block");
    }, true);
    //end settings event 'longpress'


    // 3, 2, 1 ...
    start();

});
