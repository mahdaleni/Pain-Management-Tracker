/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//Functiounmality
//Checks if user is set, and loads initial page, 
// If user is not set, or not remebered, loads the select/create user page

// Main management page
//  Select area of pain
//  Define pain type (muscle, joint, skin/surface, or combination
//  Rate pain from 1-10
//  Start/Stop, can predefine momanety, minutes, hours, days, etc.
//  Javascript needs to record the exact locatoin on the body, as well as a location specifice to the FibroMyalga test


//Reports page
// Show graph of last week
// FibroReport, 
// Export data points


// 
$( document ).ready(function() {
    if (typeof(Storage) !== "undefined") {
        
        //alert("storage available");
        firstStart();
        
} else {
    alert("Unsupoorted Browser, Please try using a modern browser such as Mozilla Firefox or Google Chrome");
}
});

function firstStart(){
        var thisUser =  localStorage.getItem("user");
        if(thisUser===null){
            loadPage("front");
        }else{
            loadPage("main");
        }
    }


function loadPage(pagename){
    
    if(pagename in pages){
       
        
        
        if(pages[pagename].needs_login===true && localStorage.getItem("user")===null){
            alert_modal("Error : Please select user", "<p>Before loading some pages, you must select or create a user.  We have loaded the page for you to do this on, for more information, please check out the help/doco page.</p>");
            pagename = 'front';
        }
        generateMenu(pagename);
        change_page_content(pagename);
        if(pages[pagename].js_run!==false){
            pages[pagename].js_run();
        }
        
      
    }else{
        alert("could not load page");
    }
    
}

function alert_modal(title, content){
    $("#alert_modal_title").html(title);
    $("#alert_modal_body").html(content);
    $("#alert_modal_wrap").modal('show');
    
}

function load_modal(title,div){
    $("#alert_modal_title").html(title);
    $("#alert_modal_body").html($("#"+div).html());
    $("#alert_modal_wrap").modal('show');
}

function generateMenu(activePage){
    //clear the menu
    $("#div_menu_left").html("");
    $("#div_menu_right").html("");
    $.each(pages,function(i,p){
        var thisMenu = "#div_menu_" + p.menu;
        $(thisMenu).append('<li><a href="#" onclick="loadPage(\''+i+'\')">'+p.name+'</a></li> ');
        if(i===activePage){
            $(thisMenu + " li:last").addClass("active");
           
        }
       // alert("added " + p.name+" to menu_"+p.menu);
    });
    
    
}

function change_page_content(pagename){
     //Check and move the old poge back to its holding area
    var old_page = $("#current_page").val();
    
    if(old_page in pages){
        $("#"+pages[old_page].div_id).html($("#page_content").html());
    }
    $("#page_content").html($("#"+pages[pagename].div_id).html());
    $("#current_page").val(pagename);
    
    $("#"+pages[pagename].div_id).html("");
    
}

function start_front_page(){
    //Get users
    var users = get_users();
     $("#front_existing_users ul").html('');
    if(users!==null){
        $.each(users,function(i,u){
           $("#front_existing_users ul").append('<li><a href="#" onclick="select_user(\''+u.name+'\')">'+u.name+'</a></li>'); 
        });
        console.log("found users");
    }else{
       $("#front_existing_users").append('<p><strong>No Users Found!</strong></p>'); 
       console.log("no users found");
       //console.log($("#front_existing_users").html());
    }
    
}

function get_users(){
     return JSON.parse(localStorage.getItem("users"));
}

function get_user(user){
    var users = get_users();
    var foundUser = null;
    $.each(users,function(i,u){
        if(u.name===user){
            foundUser = u;
        }
    });
   return foundUser;
}

function add_user(){
    var thisUser = $("#front_input_name").val();
    
    if(thisUser.length > 3){
        //check if this user is already in the system
        var users = get_users();
        var userExists = false;
        $.each(users,function(i,u){
            if(u.name===thisUser)userExists = true;
        });
        if(userExists){
            alert_modal("Error : Name alerady exists", "<p>This name already exists in your local database, please select it from the 'Existing Users' section.</p>");
          
        }else{
              $("#front_existing_users ul").append('<li><a href="#" onclick="select_user(\''+thisUser+'\')">'+thisUser+'</a></li>'); 
              save_users();
        }
      
    }else{
            alert_modal("Error : Name too short", "<p>The name must be <strong>at least 4 characters long</strong> to be added.</p>");
          
    }
    
}

function save_users(){
    var usersToAdd = [];
    var users = get_users();
    if(users===null)users=[];
    
    $.each($("#front_existing_users ul li a"),function(i,d){
        var userExists = false;
        $.each(users,function(ui,u){
            if(u.name===$(d).html()){
                userExists = true;
            }
        });
        if(!userExists){
            users.push({
                name:$(d).html()
            });
        }
    });
    
    
    // Put the object into storage
    localStorage.setItem('users', JSON.stringify(users));
    
    
}

function select_user(user){
    
    localStorage.setItem('user', JSON.stringify(get_user(user)));
    loadPage('main');
}

function get_points(timeframe){
    
    //if no timeframe is specified, set the time frame to the last 24 hours (in minutes)
    if(timeframe===undefined)timeframe=1440;
    //Update the timeframe to be the start of the time frame to this point.
    timeframe = new Date().getTime() - (timeframe * 60 * 1000);
    
    var thisUser =  JSON.parse(localStorage.getItem("user"));
    
    var points = JSON.parse(localStorage.getItem(thisUser.name + "_points"));
    if (points===null)return {};
    else {
        //Filter for time frame
        var filteredPoints = {};
        $.each(points, function(i,p){
            if(i>timeframe)filteredPoints[i]=p;
        });
            
        
        
        return points;
    }
}

function save_points(points){
    var cUser = JSON.parse(localStorage.getItem("user"));
    localStorage.setItem(cUser.name+ "_points", JSON.stringify(points));
}

function start_main_page(){
    
   //remove any newmarker if it exists
     if($("#newMarker").position()!== undefined){
            $("#newMarker").detach();
        }
    
    $("#main_img_body_outline").click(function(e) {
        main_click_img_add_dot(this,e);
      });
    
    //check for existing points (defaults to last 24 hours.
    
    var exPoints = get_points();
    $.each(exPoints,function(i,p){main_place_dot(p.position_x,p.position_y,"dot_id_"+i)});

}

function main_point_save_data(){
    //get the form data
    var formData = {};
    $.each($("#alert_modal_wrap").find("form").serializeArray(),function(i,d){
        formData[d.name]=d.value;
    });
    //add the location as percentages
    
    var id = new Date().getTime();
    var existingPoints = get_points();
    existingPoints[id]=formData;
    
    save_points(existingPoints);
    $("#alert_modal_wrap").modal('hide');
    $("#newMarker").attr('id',"point_"+id);
    
}

function main_click_img_add_dot(thisCx, e){
    
        //Check for existing marker, if it does, remove it (only should have one new marker
        if($("#newMarker").position()!== undefined){
            $("#newMarker").detach();
        }
        var offset = $(thisCx).offset();
        console.log(e.pageX - offset.left );
        console.log(e.pageY - offset.top);
        console.log(offset);
        
        var imgX = $("#main_img_body_outline").width();
        var imgY = $("#main_img_body_outline").height();
        
        var pointX = (e.pageX - offset.left +9) / imgX;    //15 px margin in bootstrap
        var pointY = (e.pageY - offset.top-9) / imgY;
        
        $("#position_x").val(pointX);
        $("#position_y").val(pointY);
        
        main_place_dot(pointX, pointY);
        
        
        load_modal("Pain Details", "page_wrap_main_modal_data");
    
}

function main_place_dot(pos_pc_x,pox_pc_y,id,pData){
    
    
        var imgX = $("#main_img_body_outline").width();
        var imgY = $("#main_img_body_outline").height();
        if(id===undefined)id="newMarker";
        
        var div = $("<div />");
        div.attr("id", id);
        div.attr("class", 'clickItem');
        div.attr("position", 'absolute');
        div.css("top", pox_pc_y * imgY);
        div.css("left", pos_pc_x * imgX);
        div.css("width", '12px');
        div.css("height", "12px");
        div.css("z-index", "99");
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.id     = "CursorLayer";
        canvas.width  = 12;
        canvas.height = 12;
        canvas.style.zIndex   = 8;
        canvas.style.position = "absolute";
        context.globalAlpha = 0.5;
        context.beginPath();
        context.arc(6,6, 6, 0, 2 * Math.PI, false);
        context.fillStyle = 'red';
        context.fill();
        
         div.append(canvas);
        $("#page_content").append(div);
        
}

function main_time_select(time){
    var startTime = new Date().getTime();
    var endTime = startTime + 600000;
    
    switch(time){
        case '30 Secs':
            endTime = startTime + 300000;
        break;
        case '10 Mins':
            endTime = startTime + 10 * 60 * 1000;
        break;
        case '1 Hour':
            endTime = startTime + 60 * 60 * 1000;
        break;
        case '8 Hours':
            endTime = startTime + 8 * 60 * 60 * 1000;
        break;
        case '1 Day':
            endTime = startTime + 24 * 60 * 60 * 1000;
        break;
    }
    
    main_set_time_fields(startTime,endTime);
    
}

function main_set_time_fields(startTimeStamp, endTimeStamp){
    var startT = new Date(startTimeStamp);
    var endT = new Date(endTimeStamp);
    $("#alert_modal_wrap").find('#time_start').val(dt_to_string(startT));
    $("#alert_modal_wrap").find('#time_end').val(dt_to_string(endT));
    
    
}

function dt_to_string(dt){
   
 
    var time = dt.getFullYear() + '-'
            + pad('00',dt.getMonth()+1,true) + '-' 
            + pad('00',dt.getDate(),true) + ' ' 
            + pad('00',dt.getHours(),true) + ':' 
            + pad('00',dt.getMinutes(),true) + ':' 
            + pad('00',dt.getSeconds(),true) ;
    console.log(time);
    return time;
}



function pad(pad, str, padLeft) {
  if (typeof str === 'undefined') 
    return pad;
  if (padLeft) {
    return (pad + str).slice(-pad.length);
  } else {
    return (str + pad).substring(0, pad.length);
  }
}







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
                'js_run':false,
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