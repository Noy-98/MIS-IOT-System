<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['profilePic'])) {
        $targetDir = "../../../uploads/applicant-profile-pictures/";
        $fileName = basename($_FILES['profilePic']['name']);
        $targetFilePath = $targetDir . $fileName;

        // Create the directory if it doesn't exist
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        if (move_uploaded_file($_FILES['profilePic']['tmp_name'], $targetFilePath)) {
            // Create a URL that can be accessed by the frontend
            $publicFilePath = "/uploads/applicant-profile-pictures/" . $fileName;
            echo json_encode(["filePath" => $publicFilePath]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "File upload failed."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "No file uploaded."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed."]);
}
?>
