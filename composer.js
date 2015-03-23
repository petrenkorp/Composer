var chords = [];
var activeChord = [];

var activeColor = "rgba(200, 0, 0, 0.2)";
var inactiveColor = "rgba(0, 0, 0, 0.1)";
var uncertainColor = "rgba(0, 0, 220, 0.2)";


function Chord(chordStart, chordEnd, id){
	this.name = "Custom Chord";
	this.key = "?";
	this.key2 = "??";
	this.start = chordStart;
	this.end = chordEnd;
	this.notes = [];
	this.id = id;
	return this;
}




$(document).ready(function() {

	//
	//EVENT HANDLERS
	//

	dragDrop(jQuery, "#dragDrop");
	$("#playPause").click(function(){wavesurfer.playPause();});
	$("#chordSnapLeft").click(function() {chordSnapLeft();});
	$("#chordSnapRight").click(function() {chordSnapRight();});
	$("#chordDelete").click(function(){chordDelete();});
	$("#prevChord").click(function(){prevChord();});
	$("#nextChord").click(function(){nextChord();});
	$("#applyChord").click(function() {applyChord();});
	$(".pianoNote").click(function(){pianoNoteClick(this);});
	$("#volume").change(function(){wavesurfer.setVolume($("#volume").val() / 100);});
	$("#songWaveform").mouseup(function(event){preventTinyChords();});


	//
	//INITIALLY DISABLE BUTTONS
	//
	$("input").attr("disabled", "true");
	$("select").attr("disabled", "true");
	$("button").attr("disabled", "true");
	$("#dragDrop").children().removeAttr("disabled");
	$("#volume").removeAttr("disabled");


	

	

	
	
	
	
	
	
	
	
	//
	//WAVESURFER events
	//

	var wavesurfer = Object.create(WaveSurfer);

	wavesurfer.init({
		container: document.querySelector('#songWaveform'),
		waveColor: 'violet',
		progressColor: 'purple',
		scrollParent: true,
		minPxPerSec: 100
	});
	wavesurfer.enableDragSelection({
		drag: false,
		color: activeColor
	});
	wavesurfer.load("test.mp3");

	wavesurfer.on("loading", function(progress) {
		wavesurfer.clearRegions();
		$("#songLoading").css("width", "100px");
		$("input").attr("disabled", "true");
		$("select").attr("disabled", "true");
		$("button").attr("disabled", "true");
		$("#dragDrop").children().removeAttr("disabled");
		$("#volume").removeAttr("disabled");
	});
	
	wavesurfer.on('ready', function () {
		$("#songLoading").html("Ready!").fadeOut();
		$("#playPause").removeAttr("disabled");
	});
	




	wavesurfer.on("region-created", function(region){
		$("input").removeAttr("disabled");
		$("select").removeAttr("disabled");
		$("button").removeAttr("disabled");

		region.on("click", function(event) {
			if (event.ctrlKey) {
				chordSelectMultiple(findChord(region));
			} else {
				chordSelect(findChord(region));
			}
		});
		
		var thisChord = new Chord(region.start, region.end, region.id);
		thisChord.region = region;
		addOrUpdateChord(thisChord);
		chordSelect(findChord(thisChord));

	});
	
	
	wavesurfer.on("region-updated", function(region){
		var newChord = new Chord(region.start, region.end, region.id);
		newChord.region = region;
		addOrUpdateChord(newChord);
		cleanUpChords();
	});

	wavesurfer.on("region-update-end", function(){

	});
	





	
	
	
	
	//
	//UTILITY FUNCTIONS
	//
	
	var chordSelect = function(chord) {
		activeChord = [];
		activeChord.push(chords.indexOf(chord));
		displayChord();
		chordApplyColor();
		$("#prevChord").removeAttr("disabled");
		$("#nextChord").removeAttr("disabled");
	};

	var chordSelectMultiple = function(chord) {
		for (var x = 0, len = activeChord.length; x < len; x++) {
			if (chords[activeChord[x]].id == chord.id) {
				if (activeChord.length > 1) {
					activeChord.splice(x, 1);
				}
				if (activeChord.length <= 1) {
					$("#prevChord").removeAttr("disabled");
					$("#nextChord").removeAttr("disabled");
				}
				displayChord();
				chordApplyColor();
				return;
			}
		}
		activeChord.push(chords.indexOf(findChord(chord)))
		displayChord();
		chordApplyColor();
		$("#prevChord").attr("disabled", "true");
		$("#nextChord").attr("disabled", "true");
	};

	var chordSelectNone = function() {
		activeChord = [];
		chordApplyColor();
		$("#prevChord").attr("disabled", "true");
		$("#nextChord").attr("disabled", "true");
	}

	var chordApplyColor = function() {
		for (var x = 0, len = chords.length; x < len; x++) {
			if (activeChord.indexOf(x) < 0) {
				if (chords[x].region.color != inactiveColor) {
					chords[x].region.update({color: inactiveColor});
				}
			} else {
				if (chords[x].region.color != activeColor) {
					chords[x].region.update({color: activeColor});
				}
			}
		}
	
	};










	
	
	var displayChord = function() {

		var notesInAllChords = [];
		var notesInSomeChords = [];
		var tempNotes = [];

		for (var x = 0, len = activeChord.length; x < len; x++) {
			//chords[activeChord[x]].region.color = activeColor;
			for (var y = 0, lenY = chords[activeChord[x]].notes.length; y < lenY; y++) {
				if (notesInAllChords.indexOf(chords[activeChord[x]].notes[y]) < 0) {
					notesInAllChords.push(chords[activeChord[x]].notes[y]);
					tempNotes.push(chords[activeChord[x]].notes[y]);
				} 
			}
		}
		
		for (var x in notesInAllChords) {
			for (var y = 0, lenY = activeChord.length; y < lenY; y++) {
				if (chords[activeChord[y]].notes.indexOf(notesInAllChords[x]) < 0) {
					notesInSomeChords.push(notesInAllChords[x]);
					tempNotes.splice(tempNotes.indexOf(notesInAllChords[x]), 1);
					break;
				}
			}
		}

		notesInAllChords = tempNotes;
		
		$("#chordNotes").find("li").each(function(index, element){
			$(element).css("background", inactiveColor);
			$(element).removeClass("inAllChords");
			$(element).removeClass("inSomeChords");
		});
		for (var x in notesInAllChords) {
			$("#note" + notesInAllChords[x]).addClass("inAllChords");
			$("#note" + notesInAllChords[x]).css("background", activeColor);
		}
		for (var x in notesInSomeChords) {
			$("#note" + notesInSomeChords[x]).addClass("inSomeChords");
			$("#note" + notesInSomeChords[x]).css("background", uncertainColor);
		}

		
		//need chordKey and chordKey2 setup - do it with dropdown menus, like the chord shortcuts
		//when the user selects/changes the key, make it the default and apply it to all newly created chords
	};



	var applyChord = function() {
		var notesArray = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B", "C"];
		var chordsArray = {
			"major": [0, 4, 7],
			"minor": [0, 3, 7],
			"7": [0, 4, 7, 10],
			"maj7":  [0, 4, 7, 11],
			"min7": [0, 3, 7, 10],
			"dim": [0, 3, 6],
			"aug": [0, 4, 8],
			"sus4": [0, 5, 7],
			"add2": [0, 2, 4, 7]
		};
		
		var note = $("#chordShortcutsNoteSelect").val();
		var chord = $("#chordShortcutsChordSelect").val();
		
		var noteNumber = notesArray.indexOf(note);
		var notesToDrawFrom = chordsArray[chord];
		var notesToApply = [];
		
		for (var x = 0; x < notesToDrawFrom.length; x++) {
			notesToApply.push(notesArray[noteNumber + notesToDrawFrom[x]]);
		}

		for (var x in activeChord) {
			chords[activeChord[x]].notes = notesToApply.slice();
			chords[activeChord[x]].name = note + " " + chord;
		}
		
		displayChord();
	};



	var pianoNoteClick = function(elem) {
		if (chords[0].id != null) {
			var clickedNote = $(elem).attr("id").slice(9);
			if ($("#note" + clickedNote).hasClass("inAllChords")) {
				for (var x in activeChord) {
					//findChord(activeChord[x]).notes.splice(activeChord[x].notes.indexOf(clickedNote), 1);
					chords[activeChord[x]].notes.splice(chords[activeChord[x]].notes.indexOf(clickedNote), 1);
				}
			} else {
				for (var x in activeChord) {
					if (chords[activeChord[x]].notes.indexOf(clickedNote) < 0) {
						chords[activeChord[x]].notes.push(clickedNote);
						//findChord(activeChord[x]).notes.push(clickedNote);
					}
				}
			}
			displayChord();
		}
	};
	



	var nextChord = function() {
		for (var x = 0, len = chords.length; x < len; x++) {
			if (chords[x].id == chords[activeChord[0]].id) {
				for (var y = 0; y < len; y++) {
					chords[y].region.update({color: inactiveColor});
				}
				chords[(x + 1) % len].region.update({color: activeColor});
				chordSelect(chords[(x + 1) % len]);
				return;
			}
		}
	};

	var prevChord = function() {
		for (var x = 0, len = chords.length; x < len; x++) {
			if (chords[x].id == chords[activeChord[0]].id) {
				for (var y = 0; y < len; y++) {
					chords[y].region.update({color: inactiveColor});
				}
				chords[(x - 1 + len) % len].region.update({color: activeColor});
				chordSelect(chords[(x - 1 + len) % len]);
				return;
			}
		}
	};
	
	
	var chordSnapRight = function() {
		for (var y = 0, len = activeChord.length; y < len; y++) {
			for (var x = 0, chordsLength = chords.length; x < chordsLength; x++) {
				if (chords[x].id == chords[activeChord[y]].id) {
					if (x < chordsLength - 1) {
						chords[activeChord[y]].region.update({end: chords[x + 1].start});
					}
					else {
						chords[activeChord[y]].region.update({end: wavesurfer.getDuration()});
					}
					break;
				}
			}
		}
	};
	
	
	var chordSnapLeft = function() {
		for (var y = 0, len = activeChord.length; y < len; y++) {
			for (var x = 0, chordsLength = chords.length; x < chordsLength; x++) {
				if (chords[x].id == chords[activeChord[y]].id) {
					if (x > 0) {
						chords[activeChord[y]].region.update({start: chords[x - 1].end});
					}
					else {
						chords[activeChord[y]].region.update({start: 0.0});
					}
					break;
				}
			}
		}
	};

	var chordDelete = function() {
		for (var x = 0, len = activeChord.length; x < len; x++) {
			chords[activeChord[x]].region.remove();
			chords.splice(chords.indexOf(findChord(chords[activeChord[x]])), 1);
		}
	};

	var preventTinyChords = function() {
		for (var x in chords) {
			if (chords[x].end - chords[x].start < 0.1) {
				chords[x].region.remove();
				chords.splice(x, 1);
			}
		}
	};
	
	
	

	function findChord(chord) {
		for (var x = 0, chordsLength = chords.length; x < chordsLength; x++) {
			if (chords[x].id == chord.id) {
				return chords[x];
			}
		}
		return null;
	}
	
	
	function addOrUpdateChord(chord) {
		for (var x = 0, chordsLength = chords.length; x < chordsLength; x++) {
			if (chords[x].id == chord.id) {
				
				chord.name = chords[x].name;
				chord.key = chords[x].key;
				chord.key2 = chords[x].key2;
				chord.notes = chords[x].notes;
				chord.region = chords[x].region;

				chords[x] = chord;
				sortChords();
				return;
			}
		}

		chords.push(chord);
		sortChords();
	}

	var cleanUpChords = function() {
		sortChords();
		if (chords.length > 1) {
			for (var x = 1, chordsLength = chords.length; x < chordsLength - 1; x++) {
				if (chords[x].end > chords[x + 1].start) {
					//var newStart = chords[x].start;
					var newEnd = chords[x + 1].start;
					chords[x].region.update({end: newEnd});
				}
				if (chords[x].start < chords[x - 1].end) {
					var newStart = chords[x - 1].end;
					//var newEnd = chords[x].end;
					chords[x].region.update({start: newStart});
					chords[x - 1].region.update({end: newStart});
					//chords[x].region.start = newStart;
				}
			}
		}
	};


	var sortChords = function() {
		tempChords = chords.slice(0);
		chords.sort(function(a, b) {
			return a.start - b.start;
		});
		
		for (var x in activeChord) {
			if (tempChords[activeChord[x]].id != chords[activeChord[x]].id) {
				activeChord[x] = chords.indexOf(findChord(tempChords[activeChord[x]]));
			}
		}
		
	};
	
	
	
});





//want: easy way to duplicate a region (its notes, its duration) and place it
	//allow users to set each region's notes to a hotkey (SHIFT + 0-9), and apply it to a selected region (0-9)?


//allow file selection via menu/input, in addition to drag and drop
//add a JSON file upload box as well, and then a "loadJSONFile" function to update song info and add regions
//allow for creating a chord progression without an mp3?
//need a SAVE button that saves the file, as well as exports the file to my server
//need to escape the text on saving
//volume slider with mute button

/*
-STRUCTURE OF FILES example:
	{
		title: "Still Crazy After All These Years",
		artist: "Paul Simon",
		chords: [
			{
				key: "G",
				key2: "major",
				start: 0.00,
				end: 2.12,
				name: "G",	//optional - Composer will plug it in whenever the chord shortcut keys are used; displayed for clarity/education
				notes: ["G", "B", "D"]
			},
			{
				key: "G",
				key2: "major",
				start: 2.12,
				end: 4.42,
				name: "G7",
				notes: ["G", "B", "D", "F"]
			},
			{
				key: "G",
				key2: "major",
				start: 4.42,
				end: 6.15,
				name: "C",
				notes: ["C", "E", "G"]
			},
			{
				key: "G",
				key2: "major",
				start: 6.15,
				end: 8.49,
				name: "Cm6",
				notes: ["C", "Eb", "A"]
			},
		]
	}
*/