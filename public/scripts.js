/*  ==========================================
    SHOW UPLOADED IMAGE
* ========================================== */
function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#imageResult')
                .attr('src', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

$(function () {
    $('#upload').on('change', function () {
        readURL(input);
    });
});


$('#btnNext').click(function()
{
    var form = new FormData();
        form.append("upload", input.files[0], "image");
        
        var settings = {
          "url": "http://localhost:3000/image",
          "method": "POST",
          "timeout": 0,
          "processData": false,
          "mimeType": "multipart/form-data",
          "contentType": false,
          "data": form
        };
        
        $.ajax(settings).done(function (response) {
          console.log(response);
          if(response != undefined && response != null)
          {
              window.location = '/addQuestions?id=' + JSON.parse(response)['_id']
          }
        });
        // window.location.replace('/addQuestions')

})


/*  ==========================================
    SHOW UPLOADED IMAGE NAME
* ========================================== */
var input = document.getElementById("upload");
var infoArea = document.getElementById( 'upload-label' );
if(input && input != undefined)
{
    input.addEventListener( "change", showFileName );
}
function showFileName( event ) {
  var input = event.srcElement;
  var fileName = input.files[0].name;
  infoArea.textContent = 'File name: ' + fileName;
  $('#btnNext').css("display", "block")

}
