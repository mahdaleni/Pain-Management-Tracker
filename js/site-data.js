
var reports = {
    'data':{
        'name':"Data Export (Download)",
        'description':"Exports filtered data to a CSV file for download to your device",
        'js_generate':"reports_generate_file",
        "filters":['all'],
        'options':[]
    },
    'simple':{
        'name':"Simple Report Table",
        'description':"Displays the data in a simple table",
        'js_generate':"report_simple",
        "filters":['all'],
        'options':[]
    }
};


var report_filters={
    pain_level:{
        name:"Pain Level",
        description:"Filter for selected pain levels and above",
        type:"number",
        int_min:1,
        int_max:10,
        default_value:1,
        filter_type:">=", 
        required:false
    },
    pain_location:{
        name:"Pain Location",
        description:"Filter for specific locations",
        type:"select",
        values:[{name:'Front',value:'Front'},{name:'Side',value:'Side'},{name:'Back',value:'Back'},{name:'All',value:'all'}],
        default_value:'all',
        filter_type:"===", 
        required:false
    },
    pain_type:{
        name:"Pain Type",
        description:"Filter for different types of pain",
        type:"select",
        values:[{name:'Muscle',value:'Muscle'},{name:'Skin',value:'Skin'},{name:'Joint',value:'Joint'},{name:'Other',value:'Other'},{name:'All',value:'all'}],
        default_value:'all',
        filter_type:"===", 
        required:false  
    },
    time_start:{
        name:"Start Date",
        description:"Filter for pain points active on or after the following date",
        type:"datetime",
        default_value:new Date().getTime() - (1000*60*60*24),
        filter_type:">", 
        required:false
    },
    time_end:{
        name:"End Date",
        description:"Filter for pain points active on or before the following date",
        type:"datetime",
        default_value:new Date().getTime(),
        filter_type:"<", 
        required:false
    },
    notes:{
        name:"Notes",
        description:"Filter for points that contain the following text in the notes",
        type:"text",
        filter_type:"contains", 
        required:false
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
