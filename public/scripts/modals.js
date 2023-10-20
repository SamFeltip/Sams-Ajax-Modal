function addClosingProceduresToModal(modal, animationTimeMs = 200) {
  
  modal.addEventListener('mouseup', function (event) {
    // Check if event.target (the thing being clicked) was the modal 
    // this will only be true if you click on the modal's ::backdrop
  
    if (event.target === modal) {
      modal.classList.add('closing');
      setTimeout(() => {
        modal.remove()
      }, animationTimeMs)
    }
  })

  modal.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      event.preventDefault();

      modal.classList.add('closing');
      setTimeout(() => {
        modal.remove()
      }, animationTimeMs)
    }
  });

  var TB_closeWindowButtonButton = document.getElementById("TB_closeWindowButton")

  TB_closeWindowButtonButton.addEventListener('click', function () {
    modal.classList.add('closing');
    setTimeout(() => {
      modal.remove()
    }, animationTimeMs)
  })

  modal.classList.add("closeTB_windowapplied")
}


function getThickboxDimentionsFromUrl(strModalAjaxURL) {
  var default_thickbox_width = "630";
  var default_thickbox_height = "440";

  if (!strModalAjaxURL) {
    return { width: default_thickbox_width, height: default_thickbox_height }
  }

  var url_params_starting_index = strModalAjaxURL.indexOf("?")
  var params_string = strModalAjaxURL.substring(url_params_starting_index + 1)

  var search_params = params_string.split("&");

  var width = default_thickbox_width;
  var height = default_thickbox_height;

  for (var pCount = 0; pCount != search_params.length; pCount++) {

    var param_key_value_pair = search_params[pCount].split("=")

    if (param_key_value_pair[0] === "width") {
      width = param_key_value_pair[1]
    }

    if (param_key_value_pair[0] === "height") {
      height = param_key_value_pair[1]
    }
  }

  return { width, height }
}

function createModalElement(thickbox_ajax_url, thickbox_header) {

  var { width, height } = getThickboxDimentionsFromUrl(thickbox_ajax_url)

  var modal = document.createElement('dialog');
  modal.id = "TB_window";

  modal.style.maxWidth = width + "px"
  modal.style.maxHeight = height + "px"

  var headerElement = document.createElement('div');
  headerElement.id = 'TB_title';

  var headerText = document.createElement('div');
  headerText.id = 'TB_ajaxWindowTitle';
  headerText.innerHTML = thickbox_header;



  var TB_closeWindowButtonLink = document.createElement('a');
  TB_closeWindowButtonLink.id = 'TB_closeWindowButton';
  TB_closeWindowButtonLink.textContent = 'close';

  // TB_closeAjaxWindow
  var TB_closeAjaxWindow = document.createElement('div');
  TB_closeAjaxWindow.id = 'TB_closeAjaxWindow'
  TB_closeAjaxWindow.appendChild(TB_closeWindowButtonLink)

  // Add the header text and close button to the header
  headerElement.appendChild(headerText);
  headerElement.appendChild(TB_closeAjaxWindow);

  var modalBody = document.createElement('div');
  modalBody.id = 'TB_ajaxContent';

  // default modal body while the ajax loads 
  var loadingImg = document.createElement('img')
  loadingImg.src = 'http://sslib.co.uk/ssLib/Images/ssLoading.gif'
  loadingImg.alt = 'loading';
  modalBody.appendChild(loadingImg);

  // Add the header and body to the dialog
  modal.appendChild(headerElement);
  modal.appendChild(modalBody);

  return modal
}


async function populateModalBodyWithAjaxRequest(strModalAjaxURL) {
  var response = await fetch(strModalAjaxURL)
  var modal_content_from_request = await response.text();

  var modalBody = document.getElementById('TB_ajaxContent')

  if (response.ok) {
    modalBody.innerHTML = modal_content_from_request

    var bodyAsDom = new DOMParser().parseFromString(modal_content_from_request, "text/xml");
    var scriptsToRun = bodyAsDom.getElementsByTagName('script')

    for (var sCount = 0; sCount !== scriptsToRun.length; sCount++) {
      eval(scriptsToRun[sCount].innerHTML)
    }


  } else {
    modalBody.innerHTML = 'could not find url to populate modal';
  }
}


function resizeThickbox(width, height) {
  var existing_modal = document.getElementById("TB_window")

  existing_modal.style.maxWidth = width + "px"
  existing_modal.style.maxHeight = height + "px"

}

function addDragableToModal(modal){

  var mouseDown = false;

  // position of mouse on modal
  var mouseInModalX = 0;
  var mouseInModalY = 0;

  var startingMousePositionX = 0;

  function saveMouseDownPosition(mouseX, mouseY){

    mouseDown = true
    var modalDimensions = modal.getBoundingClientRect()

    mouseInModalX = mouseX - modalDimensions.x
    mouseInModalY = mouseY - modalDimensions.y

    startingMousePositionX = mouseX;
  }

  function dragModalWithAnimation(mouseX, mouseY){

    if(mouseDown){
      
      var translatePositionX = mouseX - mouseInModalX 
      var translatePositionY = mouseY - mouseInModalY
      
      console.log({mouseInModalX, mouseX});

      console.log({translatePositionX});

      var distance_window_dragged = startingMousePositionX - mouseX
      

      var scale_amount = Math.pow(0.99, Math.max(0,Math.abs(distance_window_dragged) - 80))
      var rotation_amount = distance_window_dragged * -1/20

      modal.style.margin = 0
      modal.style.top = translatePositionY + "px"
      modal.style.left = translatePositionX + "px"
      
      modal.style.transform = "scale(" + scale_amount + ") rotate(" +rotation_amount+ "deg)"
    }
  }

  function releaseModalFromDrag(mouseX, mouseY){
  
    mouseDown = false

    var distance_dragged = Math.abs(startingMousePositionX - mouseX)

    if(modal === document.elementFromPoint(mouseX, mouseY) && distance_dragged > 50){
        modal.classList.add('closing-swipe');
        
        setTimeout(() => {
          modal.remove()
        }, 200)

    }else {
      modal.style.top = "";
      modal.style.left = "";
      modal.style.transform = "";
      modal.style.margin = "";
    }
    
  }

  var tbTitle = document.getElementById('TB_title')

  // touch screens need to use the title of the thickbox to swipe away instead of the entire modal
  tbTitle.addEventListener('touchstart', function (event) { saveMouseDownPosition(event.touches[0].pageX, event.touches[0].pageY) });
  tbTitle.addEventListener('touchmove',  function (event) { dragModalWithAnimation(event.touches[0].pageX, event.touches[0].pageY)});
  tbTitle.addEventListener('touchend', function (event) { releaseModalFromDrag(event.changedTouches[0].pageX, event.changedTouches[0].pageY) });


  modal.addEventListener("mousedown", function (event) {saveMouseDownPosition(event.pageX, event.pageY)})
  modal.addEventListener("mousemove", function (event) {dragModalWithAnimation(event.pageX, event.pageY)}, false);
  modal.addEventListener("mouseup", function (event) {releaseModalFromDrag(event.pageX, event.pageY)})
}

function ssNewThickbox(thickbox_ajax_url, thickboxHyperlink=null) {

  var thickbox_header = thickboxHyperlink?.getAttribute('title');

  if(!thickbox_header) {
    thickbox_header = "thickbox"
  }


  var existingModal = document.getElementById("TB_window")
  if (existingModal) {
    existingModal.remove();
  }

  var modal = createModalElement(thickbox_ajax_url, thickbox_header)

  document.body.appendChild(modal);

  addClosingProceduresToModal(modal, 200)

  // defined in ssThickboxAnimation
  if (!(addAnimationToModal === undefined)) {
    addAnimationToModal(modal, thickboxHyperlink)
  }

  modal.showModal();
  populateModalBodyWithAjaxRequest(thickbox_ajax_url)

  addDragableToModal(modal)

}


function showModalOnButtonPress(event) {

  // stop <a> from redirecting to [href]
  event.preventDefault();

  var thickboxHyperlink = event.target

  if (thickboxHyperlink.tagName !== 'A') {
    thickboxHyperlink = thickboxHyperlink.closest('.thickbox')
  }

  var thickbox_ajax_url = thickboxHyperlink.getAttribute('href');


  thickbox_ajax_url = thickbox_ajax_url + "&blnAjax=Yes"
  //replace spaces with %20 for IE7 (and maybe others)
  thickbox_ajax_url = thickbox_ajax_url.replace(/ /gi, "%20")

  ssNewThickbox(thickbox_ajax_url, thickboxHyperlink)
}


function initialiseTB_windowOpenningProcedures() {
  var thickboxButtons = document.getElementsByClassName('thickbox');

  for (var ombCount = 0; ombCount < thickboxButtons.length; ombCount++) {
    // ssHasClass
    // add class thickboxapplied not openTB...
    if (!thickboxButtons[ombCount].classList.contains('openTB_windowapplied')) {
      thickboxButtons[ombCount].addEventListener('click', showModalOnButtonPress)
      // ssAddClass
      thickboxButtons[ombCount].classList.add('openTB_windowapplied')
    }
  }
}

initialiseTB_windowOpenningProcedures()