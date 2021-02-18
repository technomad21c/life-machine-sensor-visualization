<?php
$db_conn = mysqli_connect("localhost", "root", "1", "TestDatabase");

if (!$db_conn) {
    echo '{"error": DB_CONNECTION, "message": "' . $mysqli_connect_error() . '"}';
    exit();
}

$query = "SELECT gateway_id, sensor_id, sensed_time, rms_x, rms_y, rms_z, min_x, min_y, min_z, max_x, max_y, max_z FROM sensor_data 
            WHERE sensor_id = ? AND date(sensed_time) = ?";

$stmt = mysqli_prepare($db_conn, $query);

$sensor_id = filter_input(INPUT_GET, "sensor_id");
$input_date = filter_input(INPUT_GET, "date");
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

$temp_date = strtotime($input_date);
$date = date('Y-m-d', $temp_date);
// $date = date('Y-m-d h:i:s', $temp_date);
if (!$date) {
    $res = array("ERROR" => "Date Format Invalid");
    echo json_encode($res);
}

mysqli_stmt_bind_param($stmt, 'ss', $sensor_id, $date);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if ( mysqli_num_rows($result) >= 0) {
    $rows = mysqli_fetch_all($result, MYSQLI_ASSOC);
    $res = array('result' => $rows);
} else {        
    $res = array('error' => 'SQL error');
    echo json_encode($res);
}

echo json_encode($res);
mysqli_free_result($result);
mysqli_close($db_conn);

?>