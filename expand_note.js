if ((document.title.match(/New Note/g) != null) || (document.title.match(/New Resolution/g) != null)) {

	// Grabbing the form body for Landesk
	var content_id = document.getElementById("formBody");
	var id_container = content_id.getElementsByClassName("printOnlyText");
	var parent = content_id.parentNode;

	// Get the data from local storage then delete
	var description_text = localStorage.incident_name;
	var incident_username = localStorage.incident_username;
	console.log(description_text);
	console.log(incident_username);
	localStorage.removeItem("incident_name");
	localStorage.removeItem("incident_username");
	
	// Create the another form below it
	var area_node = document.createElement('form');
	area_node.setAttribute('type','form');
	area_node.setAttribute('name', 'Description Holder');
	area_node.setAttribute('id', 'description_text');
	content_id.appendChild(area_node);
	
	// CSS this up
	var description_container = document.getElementById("description_text");
	description_container.style.marginLeft = '50px';
	description_container.style.marginTop = '50px';
	description_container.style.marginRight = '50px';
	description_container.style.paddingLeft = '20px';
	description_container.style.paddingTop = '20px';
	description_container.style.paddingRight = '20px';
	description_container.style.paddingBottom = '20px';
	description_container.style.borderStyle = 'double';
	description_container.style.backgroundColor = '#FFFFFF';
	
	// Add text
	description_container.innerHTML += "<strong>Job Description</strong><br><br><strong>User's name:</strong>  ";
	description_container.innerHTML += incident_username;
	description_container.innerHTML += "<br><br>";
	description_container.innerHTML += "<strong>Please note that the tabs are sorted from newest to oldest.  Tab 0 is the latest note.</strong></br></br>";
	
	// Lets create the tabbed list.  Start with the initial job thent he jobs.
	var dataStored = JSON.parse(localStorage.getItem('notes'));
	console.log(dataStored);
	
	var note_length = 0;
	
	if (dataStored) {
		note_length = dataStored.length;
	}
	
	//Initial title
	var note_tabs = "<div id='tabs'><ul><li><a href='#tabs-0'>Original Job</a></li>";
	
	// Generating tab titles BOOYAH
	for (var note_index = 0; note_index < note_length; note_index++) {
		note_tabs += "<li><a href='#tabs-" + (note_index + 1) + "'> Note " + note_index + "</a></li>";
	}
	
	// Ending list
	
	note_tabs += "</ul><div id='tabs-0'><h2>Original Message</h2><p><pre style='width: 60%; white-space: pre-wrap;'>" + description_text + "</pre></p></div>";
	
	for (note_index = 0; note_index < note_length; note_index++) {
		note_tabs += "<div id='tabs-" + (note_index + 1) + "'><h2>" + dataStored[note_index][0] + "</h2><p><strong>Notified End User: </strong> " + dataStored[note_index][5] + "        <strong>Notified Assignee:</strong> " + dataStored[note_index][6] + "<br/><br/>";
		note_tabs += "<strong>Creation Date:</strong>  " + dataStored[note_index][2] + "   " + dataStored[note_index][3] + "              by:  " + dataStored[note_index][4] + "</br><br/>";
		note_tabs += "<pre style='width: 60%; white-space: pre-wrap;'>" + dataStored[note_index][1]+ "</pre></p></div>";
	}
	
	note_tabs += "</div>";
	
	console.log(note_tabs);
	
	description_container.innerHTML += note_tabs;
	
	

    $( "#tabs" ).tabs();
    //$( "#tabs li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );
	
	
} else if (document.title.match(/Incident/g) != null) {

	if (document.title.match(/New Incident/g) == null) {}
	
	if (localStorage.getItem('incident_id_key') != document.URL) {
		localStorage.removeItem('notes');
		localStorage.setItem('incident_stage', 0);
	}
	
	var list_head = document.getElementsByClassName("actionPanelItem")[0];
	var list_container = list_head.parentNode;
	list_container.innerHTML += "<li><a id='note_grabber'>   <strong>-></strong>  Note Grabber</a></li>"; 
	document.getElementById("note_grabber").addEventListener("click", grab_notes);

	// Grab the Details field from Landesk
	var content_id = document.getElementById("mainForm-GroupBox2");
	var details_id = content_id.getElementsByClassName("printOnlyText");
	var details_text = details_id[0].innerHTML;
	
	// Grab the name of the user from Landesk
	var name_id = document.getElementById("mainForm-RaiseUser2Display");
	var name = name_id.value;
	
	// Attempt to put into local storage
	try{
		localStorage.incident_name = details_text;
		localStorage.incident_username = name;
		if (localStorage.incident_stage != 2) {
			localStorage.incident_stage = 0;
		}
	}catch(e){
		if(e == QUOTA_EXCEEDED_ERR){
			alert('Quota Exceeded');
		}
	}
	
	
} else if (document.title.match(/Note - /) != null) {

	if (localStorage.incident_stage != 1) {
		return;
	}
	
	var note_array = new Array();
	note_array.push(document.getElementById("mainForm-Title2").innerHTML);
	note_array.push(document.getElementById("mainForm-Text").innerHTML);
	note_array.push(document.getElementById("mainForm-CreationDate-date").value);
	note_array.push(document.getElementById("mainForm-CreationDate-time").value);
	note_array.push(document.getElementById("mainForm-CreationUserTitleDisplay").value);
	note_array.push(document.getElementById("mainForm-_NotifyRaiseUser").checked);
	note_array.push(document.getElementById("mainForm-_NotifyAssignee").checked);
	
	noteJSON = JSON.parse(localStorage.getItem('notes') || "null");
	
	if (noteJSON) {
		noteJSON.push(note_array);
		localStorage.setItem('notes', JSON.stringify(noteJSON));
	} else {
		noteJSON = new Array();
		noteJSON.push(note_array);
		localStorage.setItem('notes', JSON.stringify(noteJSON));
	}
	
	// Now we move on to the next note
	
	var previous = document.getElementById("previousPageLink");
	if (previous.href =="") {
		// Then we are done stop clicking
		localStorage.incident_stage = 2;
		simClick(document.getElementById("mainForm-CancelButton"));
	} else {
		simClick(previous);
	}
}

/**
*	simclick(object id) 
*   -  Jeremy's helper function to simulate a click on an object
**/
function simClick(id){
	var initialEvent = document.createEvent("MouseEvents");
	initialEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	id.dispatchEvent(initialEvent);
}

function grab_notes() {

	try{
		localStorage.incident_stage = 1;
		localStorage.setItem('incident_id_key', document.URL);
	}catch(e){
		if(e == QUOTA_EXCEEDED_ERR){
			alert('Quota Exceeded');
		}
	}
	
	if (JSON.parse(localStorage.getItem('notes') || "null")) {
		localStorage.removeItem('notes');
	}
	
	// Need to check to see if Notes exist or not.
	
	var note_tab = document.getElementById("_btn_4");
	if (note_tab == null) {
		// Well fudge no notes to do lets go back to NOPE
		alert("No notes noob");
		try{
			localStorage.incident_stage = 0;
		}catch(e){
			if(e == QUOTA_EXCEEDED_ERR){
				alert('Quota Exceeded');
			}
		}
		return;
	}
	
	console.log("yes");
	
	simClick(note_tab);
	
	var note_list = document.getElementById("mainForm-NotesBody");
	console.log(note_list);
	var first_note = note_list.getElementsByClassName("listBodyRow pointerCursor")[0];
	console.log(first_note);
	var first_field = first_note.getElementsByClassName("listBodyCell")[0];
	console.log(first_field);
		
	simClick(first_field);
};