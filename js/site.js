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
     
        var html_imports = [
            "./content/page_main.html",
            "./content/page_front.html",
            "./content/page_settings.html",
            "./content/page_reports.html",
            "./content/page_docs.html",
            "./content/alert_point_data.html"
        ];
        //Get imported content
        $.when.apply(null,html_imports.map(function(url){
            return $.get(url,function(res){
                $("#page_template_wrap").append(res);
            });
        })).then(function(){
            //Once all content imported.
            var thisUser =  get_current_user();
            if(thisUser===null){
                loadPage("front");
            }else{
                loadPage("main");
            }
        });

    }


function loadPage(pagename){
    
    if(pagename in pages){
       
        
        
        if(pages[pagename].needs_login===true && get_current_user()===null){
            alert_modal("Error : Please select user", "<p>Before loading some pages, you must select or create a user.  We have loaded the page for you to do this on, for more information, please check out the help/doco page.</p>");
            pagename = 'front';
        }
        generateMenu(pagename);
        change_page_content(pagename);
        if(pages[pagename].js_run!==false){
            pages[pagename].js_run();
        }
        
      
    }else{
        console.log("could not load page");
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
     console.log("Loading " + pagename + " : " + JSON.stringify(pages[pagename]));
    console.log($("#"+pages[pagename].div_id).html());
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
        //console.log("found users");
    }else{
       $("#front_existing_users").append('<p><strong>No Users Found!</strong></p>'); 
       console.log("no users found");
       //console.log($("#front_existing_users").html());
    }
    
}

function get_users(){
    return db_local_get_users();
}

function get_user(user){
   return db_local_get_user(user);
}


function delete_user_current(){
    //removes the current user & their data.
    
    var cUser = get_current_user();
    if(cUser!== null && cUser.name !== undefined){
        console.log('removing user ' +cUser.name+" & all their data" );
        db_local_remove_user(cUser.name);
        
        localStorage.removeItem('user');
        loadPage('front');
    }else{
        console.log("could not select user to delete : "+cUser)
    }
   
}

function add_user(){
    var addUserResult = db_local_add_user($("#front_input_name").val());
    if(addUserResult==="true"){
        start_front_page();
    }
    else{
        
         alert_modal("Error", $("#front_input_name").val() + " - " + addUserResult);
          
    }
    
    
}

function select_user(user){
    
    localStorage.setItem('user', JSON.stringify(get_user(user)));
    loadPage('main');
}

function get_points(timeframe, type, loc){
    return db_local_get_points(timeframe,type,loc);
}

function get_current_user(){
    return db_local_get_current_user();
}
//
//function add_user(user){
//    db_local_add_user(user);
//}

//returns an array of point data for the PID, or undefined if nothing set.
function get_point_data(pid){
    return db_local_get_point(pid);
}

function save_point(point){
    db_local_save_point(point);
}

function start_main_page(){
    
    //Remove any window listeners (used for resizing)
    $(window).off();
   
    $("#main_img_body_outline").click(function(e) {
        main_click_img_add_dot(this,e);
      });
    
    
    //check for existing points (defaults to last 24 hours, 24 hours * 60 minutes)
    main_load_dots(12*60);
    
    $('.clickItem').popover({trigger:'hover'});
    $('.main_point_timeframe').click(function(){
        //Convert the hours for timeframe into minutes
        main_load_dots($(this).find("input").val());
    });
    $('.main_point_paintype').click(function(){
        //Convert the hours for timeframe into minutes
        main_load_dots(undefined,$(this).find("input").val());
    });
    $('.main_point_painloc').click(function(){
        //Convert the hours for timeframe into minutes
        main_load_dots(undefined,undefined,$(this).find("input").val());
    });
    
    $(window).on('resize', function(){
        
        start_main_page();
    });

}

function main_resize(){
    $(".clickItem").remove();
    
    var exPoints = get_points();
    $.each(exPoints,function(i,p){main_place_dot(p.position_x,p.position_y,"dot_id_"+i,p)});
    
    $('.clickItem').popover({trigger:'hover'});
}

function main_point_save_data(){
    //get the form data
    var timeId = new Date().getTime();
    var formData = {};
    $.each($("#alert_modal_wrap").find("form").serializeArray(),function(i,d){
        formData[d.name]=d.value;
    });
    //add the location as percentages
    //if ID is new
    if(formData['id']==='new' || formData['id']===undefined){
        formData['id']=timeId;
    }
    
    
    save_point(formData);
    $("#alert_modal_wrap").modal('hide');
    
    //Remove the new marker point, and any points with this ID & re-add it
    
    
    $("#newMarker").remove();
    $("#"+formData['id']).remove();
    main_place_dot(formData['position_x'],formData['position_y'],"dot_id_"+formData['id'],formData);
//    $("#newMarker").attr('id',"dot_id_"+formData['id']);
    
}


//Edit a point when clicked
function main_point_click(pid){
    main_point_edit(pid);
}

function main_point_edit(point_id){
    //Loads the point in the div into the edit window.
    //First, load the modal
    
    load_modal("Pain Details", "page_wrap_main_modal_data");
    var pid = point_id.substring(8);
    //get the point values
    var pointDat = get_point_data(pid);
    $.each(pointDat,function(k,v){
        $("#alert_modal_wrap").find("#"+k).val(v);
    });
    //console.log(pointDat);
    
    
    
}
function main_click_img_add_dot(thisCx, e){
    
        //Check for existing marker, if it does, remove it (only should have one new marker
        if($("#newMarker").position()!== undefined){
            $("#newMarker").detach();
        }
        var offset = $(thisCx).offset();
//        console.log(e.pageX - offset.left );
//        console.log(e.pageY - offset.top);
//        console.log(offset);
        
        var imgX = $("#main_img_body_outline").width();
        var imgY = $("#main_img_body_outline").height();
        
        var pointX = (e.pageX - offset.left +9) / imgX;    //15 px margin in bootstrap
        var pointY = (e.pageY - offset.top-9) / imgY;
        
        $("#position_x").val(pointX);
        $("#position_y").val(pointY);
        
        main_place_dot(pointX, pointY);
        
        
        load_modal("Pain Details", "page_wrap_main_modal_data");
    
}

function main_load_dots(timeframe, pType,pLoc){
    //remove any newmarker if it exists
     if($("#newMarker").position()!== undefined){
            $("#newMarker").detach();
            
        }
    
    //if the time frame is undefined, see if we can get it.
    if(timeframe===undefined)timeframe = $("#main_buttons_group_timeframe .active input").val();
    //if the pain type is undefined, see if we can get it.
    if(pType===undefined)pType = $("#main_buttons_group_type .active input").val();
    //if the pain location is undefined, see if we can get it.
    if(pLoc===undefined)pLoc = $("#main_buttons_group_loc .active input").val();
    
    //Remove any existing markup/html within the main body
    $(".main_pain_point_marker").remove();
    
    
    
  
    var exPoints = get_points(timeframe,pType,pLoc);
    $.each(exPoints,function(i,p){main_place_dot(p.position_x,p.position_y,"dot_id_"+i,p);});
}


function main_place_dot(pos_pc_x,pox_pc_y,id,pData){
    
    
        var imgX = $("#main_img_body_outline").width();
        var imgY = $("#main_img_body_outline").height();
        if(id===undefined){
            id="newMarker";
        }
        
        var div = $("<div />");
        div.attr("id", id);
        div.attr("class", 'clickItem main_pain_point_marker');
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
        
        
        if(pData!==undefined && id!=="newMarker"){
            
            //prepare friendly date for showing on popup
            var timeFriendlyStart = get_time_string(pData.time_start, pData.time_end);
            
            //Popup Data
            div.attr("data-toggle", 'popover');
            div.attr("title", pData.pain_type + " pain"); 
            div.attr("data-html", 'true'); 
            div.attr("data-content", timeFriendlyStart + "<br>" +  pData.notes); 
            div.attr("onclick","main_point_click('#"+id+"')");
            //Add the popover for the dot
            
            switch (pData.pain_type.toLowerCase()){
                case "joint":
                  context.fillStyle = '#F00000';
                break;
                case "muscle":
                  context.fillStyle = '#F000F0';
                break;
                case "skin":
                  context.fillStyle = '#F0F000';
                break;
                case "other":
                  context.fillStyle = '#404040';
                break;
                default:
                    context.fillStyle = '#b08040';
                break;
            }
        }
        else{
            
            context.fillStyle = 'red';
        }
        context.fill();
        
         div.append(canvas);
        $("#main_img_body_wrap").append(div);
        
        //now that the new div is in the active DOM, check and add hover listener
        if(pData!==undefined && id!=="newMarker"){
            
            $('.clickItem').popover({trigger:'hover'});
        }
        
}

function main_time_select(time){
    var startTime = new Date().getTime();
    var endTime = startTime + 600000;
    
    switch(time){
        case '30 Secs':
            endTime = startTime + 30000;
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

function get_time_string(strTimeStart, strTimeEnd){
    var timeFriendlyStart = get_time_offset_string(new Date(strTimeStart).getTime());
    var timeDuration = get_time_offset_string(new Date().getTime() - (new Date(strTimeEnd).getTime()-new Date(strTimeStart).getTime()));
    var timeFriendlyEnd = get_time_offset_string(strTimeEnd);
    
    //Math.floor((new Date().getTime() - new Date(time).getTime())
    
    return timeFriendlyStart + " ago : Duration = " + timeDuration;
}


function get_time_offset_string(timestamp){
    var timeSeconds = Math.floor((new Date().getTime() - timestamp) /1000);
    var friendlyTime = "";
    if(timeSeconds < 61){
        var friendlyTime = timeSeconds + "s"; 
    }
    else if(timeSeconds < 3600){
        var friendlyTime = Math.floor(timeSeconds/60) + "m"; 
    }
    else if(timeSeconds < 86400){        //24 Hours
        var friendlyTime = Math.floor(timeSeconds/60/60) +"h " + Math.floor((timeSeconds/60)%60) + "m"; 
    }
    else if(timeSeconds < 604800){        //7 days
        var friendlyTime = Math.floor(timeSeconds/24/60/60) +"d " + Math.floor((timeSeconds/60/60)%24) + "h"; 
    }
    else if(timeSeconds > 604800){        //7 days
        var friendlyTime = Math.floor(timeSeconds/7/24/60/60) +"w " + Math.floor(timeSeconds/60/60/24%7) + "d"; 
    }
    
    return friendlyTime;
}

function main_set_time_fields(startTimeStamp, endTimeStamp){
    var startT = new Date(startTimeStamp);
    var endT = new Date(endTimeStamp);
    
    //if this is a new ID, set the start time.
    if($("#alert_modal_wrap").find("#id").val() ==='new'){
        $("#alert_modal_wrap").find('#time_start').val(dt_to_string(startT));
        console.log("Found value to be new : " + $("#alert_modal_wrap").find("#id").val());
    }
    
    //Set the end time.
    $("#alert_modal_wrap").find('#time_end').val(dt_to_string(endT));
    
    
}





function start_reports_page(){
    
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

    
function db_local_get_points(timeframe,pain_type, pain_location){
    
    var thisUser =  JSON.parse(localStorage.getItem("user"));
    
    var points = JSON.parse(localStorage.getItem(thisUser.name + "_points"));
    if (points===null)return {};
    
    //Create an array to store filtered points in
    var filteredPoints = {};
    
    var timeframestamp = new Date().getTime()-(timeframe*60*60*1000);
    
    
    
    $.each(points,function(i,p){
        var tfAcc, tyAcc, loAcc = false;
        
        //Check the timeframe first
        if(timeframe===undefined || timeframe==="all" )tfAcc=true;
        else{
             if(    i>timeframestamp || 
                    timeframestamp < new Date(p.time_end).getTime()){
                 tfAcc=true;
             }
        }
        
        //Now check for pain type
        if(pain_type===undefined || pain_type==="all"){
            tyAcc=true;
        }
        else{
            if(pain_type===p.pain_type )tyAcc=true;
        }
        
        
        //Now check for pain type
        if(pain_location===undefined || pain_location==='all'){
            loAcc=true;
        }
        else{
            if(pain_location===p.pain_location)loAcc=true;
        }
        
        
        
        //Now if it passed both filters, add it to the filtered points
        if(tfAcc===true && tyAcc===true && loAcc===true)filteredPoints[i]=p;
        
    });
    
    return filteredPoints;
   
}

function db_local_get_point(pid){
    var allPoints = db_local_get_points();
    var foundP = undefined;
    $.each(allPoints,function(i,p){
        if(i===pid){
            foundP = p;
            return false;   //Break the for each loop
        }
    });
    
    return foundP;
    
}


function db_local_save_point(point){
    //this function adds/edits points into the local database
    var existingPoints = get_points();
    
    var cUser = JSON.parse(localStorage.getItem("user"));
    existingPoints[point.id]=point;
    localStorage.setItem(cUser.name+ "_points", JSON.stringify(existingPoints));
}

function db_local_get_current_user(){
    return JSON.parse(localStorage.getItem("user"));
}

function db_local_get_user(user){
    var users = db_local_get_users();
    var foundUser = null;
    $.each(users,function(i,u){
        if(u.name.toLowerCase()===user.toLowerCase()){
            foundUser = u;
        }
    });
   return foundUser;
}

function db_local_get_users(){
     return JSON.parse(localStorage.getItem("users"));
}

function db_local_remove_user(user){
    if(db_local_get_user(user)!==null){
        //Remove the users data
        localStorage.removeItem(user + "_points");
        
        //Remove the user from the list
        var users = db_local_get_users();
        
        var newUsers = [];
        $.each(users,function(i,u){
            if(u.name.toLowerCase()!==user.toLowerCase()){
                newUsers.push(u);
            }
            else{
                console.log("removing " + u.name + " from local DB");
            }
        });
        
        localStorage.setItem('users', JSON.stringify(newUsers));
        
        
    }
    else{
        console.log("could not delete user "+user + ".  Not found in local DB.");
    }
    
}

function db_local_add_user(user){
    
    if(user.length > 3){
        //check if this user is already in the system
        var users = get_users();
        
        if(users===null)users=[];
        
        var userExists = false;
        $.each(users,function(i,u){
            if(u.name.toLowerCase()===user.toLowerCase())userExists = true;
            
        });
        if(userExists===true){
            return "<p>This name already exists in your local database, please select it from the 'Existing Users' section.</p>";
          
        }else{

            users.push({
                name:user
            });


            // Put the object into storage
            localStorage.setItem('users', JSON.stringify(users));
    
            return "true"; 
        }
      
    }else{
         return "<p>The name must be <strong>at least 4 characters long</strong> to be added.</p>";
          
    }
}