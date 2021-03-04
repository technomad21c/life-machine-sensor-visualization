<?php
$ini = parse_ini_file('app.ini');
$db_conn = mysqli_connect($ini['db_host'], $ini['db_user'], $ini['db_password'], $ini['db_name']);

if (!$db_conn) {
    echo '{"error": DB_CONNECTION, "message": "' . $mysqli_connect_error() . '"}';
    exit();
}

header("Access-Control-Allow-Origin: *");
header('Content-type: application/json');

$opt = filter_input(INPUT_GET, "option", FILTER_SANITIZE_STRING);
if (!$opt) {
    $res = array('error' => 'Option value must be provided');
    echo json_encode($res);
    exit();
}

switch (strtolower($opt)) {
    case "sensor_id":
        $query = "SELECT distinc (sensor_id) FROM sensor_data";
        $stmt = mysqli_prepare($db_conn, $query);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        if ( mysqli_num_rows($result) > 0) {
            $rows = mysqli_fetch_all($result, MYSQLI_ASSOC);
            $res = array('data' => $rows);
            echo json_encode($rows);
        } else {
            $res = array('error' => 'DB_ERROR', 'message' => 'No Sensor Type Data found');
            echo json_encode($res);
        }
        mysqli_free_result($result);
        break;

    default:
        $res = array('error' => 'DB_ERROR', 'message' => 'No Option Data found with ' . $opt);
        echo json_encode($res);
}

mysqli_close($db_conn);
?>