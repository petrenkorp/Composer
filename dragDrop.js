var dragDrop = function($, div) {
	var dragAndDroppable = document.querySelector(div);
	dragAndDroppable.addEventListener("drop", function(e) {
		e.stopPropagation();
        e.preventDefault();
		
		if (e.dataTransfer.files.length) {
			wavesurfer.loadBlob(e.dataTransfer.files[0]);
			console.log(e.dataTransfer.files[0]);
		} else {
			wavesurfer.fireEvent('error', 'Not a file');
		}
	});
	
	if(window.FileReader) { 
	  $(window).on("load", function() {
		
		function cancel(e) {
		  if (e.preventDefault) { e.preventDefault(); }
		  return false;
		}
	  
		$(div).on("dragover", cancel).on("dragenter", cancel);
	  });
	} else { 
	  document.getElementById('status').innerHTML = 'Your browser does not support the HTML5 FileReader.';
	}
};