var _DocObj = null;
(function () {
    'use strict';
    app.controller('DocumentFileCtrl', ["$rootScope", "$scope", "$timeout", "$modal", "$route", "$routeParams", "$location", "$sce", "$templateCache", "$filter",
        "$q", "$http", "$compile", "blockUI",
        function ($rs, $scope, $timeout, $modal, $route, $routeParams, $location, $sce, $templateCache, $filter, $q, $http, $compile, blockUI) {

            _DocObj = new PageObj($rs, $scope, $timeout, $modal, $route, $routeParams, $location, $sce, $templateCache, $filter, $q, $http, $compile, blockUI);

            _DocObj.Init();
            _DocObj.BindFormEvents();
            _DocObj.ParseDatePickerCtrl();
            _DocObj.ParseMonthPickerCtrl();
            _DocObj.ParseDropdownCtrl("", ".select2_single");

            var mCount;
            _DocObj.$scope.AttachFileLst = [];
            _DocObj.$scope.AddAttachFile = function () {
                debugger
                mCount = _DocObj.$scope.AttachFileLst.length + 1;
                _DocObj.$scope.AttachFileLst.push({
                    RowId: mCount,
                    AttachType: "0",
                    File: "",
                    DocMode: 0
                });
            };
            _DocObj.$scope.DeleteFileItem = function (vIndex, vRowId) {
                if (confirm("Are you sure want to perform this action?")) {
                    for (var i = 0; i < $scope.AttachFileLst.length; ++i) {
                        if (_DocObj.$scope.AttachFileLst[i].RowId == vRowId) {
                            _DocObj.$scope.AttachFileLst.splice(vIndex, 1);
                        }
                    }
                }
            }
            // Delete Data Frm DataBase
            _DocObj.$scope.DeleteFile = function (vContAtchId) {
                if (confirm("Are you sure want to perform this action?")) {
                    var mContId = $("#hiddContId").val();
                    var formData = new FormData();
                    formData.append('ContAtchId', vContAtchId);
                    $.ajax({
                        type: "POST",
                        url: _RootURL + "Rent/Contract/DeleteContAttch",
                        data: formData,
                        contentType: false,
                        processData: false,
                        success: function (data) {
                            if (data.IsSuccess == "Y") {
                                bootbox.alert("Files Deleted successfully!");
                                window.location.href = _RootURL + "RENT/Contract/ContDtlsView?vContId=" + mContId;
                                return false;
                            } else {
                                bootbox.alert("Failed to Deleted files.");
                            }
                        },
                        error: function (response) {
                            bootbox.alert("Error: " + response.responseText);
                        }
                    });

                }
            }

            var mContAttachmentJson = $("#hiddContAttachmentJson").val();
            debugger
            if (mContAttachmentJson == undefined || mContAttachmentJson == "") {
                _DocObj.$scope.AttachFileLst = [];
            } else {
                _DocObj.$scope.AttachFileLst = JSON.parse(mContAttachmentJson);
            }



        }
    ]);
    app.directive('onFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('ngRepeatFinished');
                    });
                }
            },
        };
    });
})(window.angular);



function GetAllData() {
    debugger
    getFile();
    var contId = $('#hiddenContId').val();
    var formData = new FormData();

    $('input[type="file"]').each(function () {
        var fileInput = $(this);
        var files = fileInput.get(0).files;
        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                formData.append('files[]', files[i]);
            }
        }
    });

    var attachmentsJson = $('#hiddContAttachmentJson').val();
    formData.append('attachments', attachmentsJson);
    formData.append('contId', contId);

    $.ajax({
        type: "POST",
        url: _RootURL + "Rent/Contract/SaveAtch",
        data: formData,
        contentType: false,
        processData: false,
        success: function (data) {
            if (data.IsSuccess == "Y") {
                bootbox.alert("Files uploaded successfully!"); {
                    window.location.href = _RootURL + "RENT/Contract/GetContDtls?vContId=" + contId;
                    return false;
                }
            } else {
                bootbox.alert("Failed to upload files.");
            }
        },
        error: function (response) {
            bootbox.alert("Error: " + response.responseText);
        }
    });
}



function getFile() {
    var attachFileLst = _DocObj.$scope.AttachFileLst || [];
    var attachments = [];
    debugger
    var fileInputs = $('input[type="file"]');

    if (fileInputs.length === 0 || attachFileLst.length === 0) {
        bootbox.alert("No file inputs or attachments found.");
        return;
    }

    fileInputs.each(function (index) {
        var fileInput = $(this);
        var files = fileInput.get(0).files;

        // If there are no files, continue to the next input
        if (files.length === 0) return;

        // Ensure there's a corresponding AttachType for this input
        if (index >= attachFileLst.length) {
            bootbox.alert("Mismatch between file inputs and attachment list.");
            return;
        }

        // AttachType for this file input
        var attachItem = attachFileLst[index];
        var id = attachItem.AttachType;

        // Process each file for this input
        for (var j = 0; j < files.length; j++) {
            var fileName = files[j].name;
            var fileExtension = '.' + fileName.split('.').pop();
            attachments.push({
                FileName: files[j].name,
                AttachType: id,
                FileSize: files[j].size,
                FileType: fileExtension
            });
        }
    });

    var attachmentsJson = JSON.stringify(attachments);

    $('#hiddContAttachmentJson').val(attachmentsJson);

}

function DownloadContAtch(vObj) {
    debugger
    var mContAttachId = $(vObj).closest("tr").find(".hiddContAttachId").val();
    var mContId = $(vObj).closest("tr").find(".hiddContId").val();
    var mAttachType = $(vObj).closest("tr").find(".hiddAttachType").val();
    var mFile = $(vObj).closest("tr").find(".hiddFile").val();
    var mCreatedBy = $(vObj).closest("tr").find(".hiddCreatedBy").val();

    window.location.href = _RootURL + "Rent/Contract/DownloadContAttch?FileName=" + mFile + "&Id=" + mCreatedBy + "&ContId=" + mContId;
    return false;

}