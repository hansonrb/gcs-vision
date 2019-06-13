$(document).ready(function() {
  $("#myform").on('submit', function(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var file = $("#image")[0].files[0];

    $.get('/upload/signedurl?fileName=' + file.name + '&fileType=' + file.type,
      function(resp) {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", resp.signedUrl, true);

        xhr.onload = () => {
          const status = xhr.status;
          if (status === 200) {
            alert("File is uploaded");

            $.get('/upload/annotate?fileName=' + resp.fileName,
              function(annotated) {
                console.log(annotated);
              }
            );
          } else {
            alert("Something went wrong!");
          }
        };

        xhr.onerror = (err) => {
          console.log(err);
          alert("Something went wrong");
        };

        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      }
    );
  });
});
