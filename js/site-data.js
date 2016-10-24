
var reports = {
    'data':{
        'name':"Data Export Table",
        'description':"Exports filtered data to a CSV file for download to your device",
        'output':"file",
        "fields":{},
        'options':{}
    },
    'Simple':{
        'name':"Simple Report",
        'description':"Displays the data in a simple & easy to read report",
        'output':"template_simple",
        "fields":{},
        'options':{}
    }
};

var pages = {
            'front':{
                'name':"Change User",
                'div_id':'page_wrap_front',
                'js_run':function(){start_front_page();},
                'menu':'right',
                "needs_login":false
            },
            'main':{
                'name':"Pain Management",
                'div_id':'page_wrap_main',
                'js_run':function(){start_main_page();},
                'menu':'left',
                "needs_login":true
            }, 
            'reports':{
                'name':"Reports",
                'div_id':'page_wrap_reports',
                'js_run':function(){start_reports_page();},
                'menu':'left',
                "needs_login":true
            },
            'settings':{
                'name':"Settings",
                'div_id':'page_wrap_settings',
                'js_run':false,
                'menu':'right',
                "needs_login":true
            }, 
            'help':{
                'name':"Help/Doco",
                'div_id':'page_wrap_doco',
                'js_run':false,
                'menu':'right',
                "needs_login":false
            }
    };
