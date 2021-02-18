<?php
$db_conn = mysqli_connect("localhost", "root", "1", "TestDatabase");

if (!$db_conn) {
    echo '{"error": DB_CONNECTION, "message": "' . $mysqli_connect_error() . '"}';
    exit();
}

$comp_dataset = array(
    "1" => array (
        "factor" => "RMS_Y",
        "location" => "Motor/Fan",
        "healthy1" => array(
            "sensor_id" => "00:13:A2:00:41:A8:5A:7C",
            "datetime" => "2020-10-27 12:35:00"),
        "healthy2" => array(
                    "sensor_id" => "00:13:A2:00:41:A8:60:87",
                    "datetime" => "2020-11-12 12:07:00"),
        "faulty" => array (
            "sensor_id" => "00:13:A2:00:41:A8:5C:3A",
            "datetime" => "2021-02-12 12:04:00")
        ),
    "2" => array (
        "factor" => "RMS_Y",
        "location" => "Interior Near Screw",
        "healthy1" => array(
            "sensor_id" => "00:13:A2:00:41:A8:60:87",
            "datetime" => "2020-11-24 14:50:00"),
        "faulty" => array(
            "sensor_id" => "00:13:A2:00:41:A8:5C:3A",
            "datetime" => "2021-02-10 12:55:00")
        ),

      "3" => array (
            "factor" => "RMS_Y",
            "location" => "Interior Lower Brace Near Motor",
            "healthy1" => array(
                "sensor_id" => "00:13:A2:00:41:A8:60:87",
                "datetime" => "2020-11-24 15:37:00"),
            "faulty" => array(
                "sensor_id" => "00:13:A2:00:41:A8:5C:3A",
                "datetime" => "2021-02-10 11:12:00")
      )
    );

$query = "SELECT rms_y FROM sensor_data
            WHERE sensor_id = ? AND sensed_time > ? LIMIT 0, 85";

$stmt = mysqli_prepare($db_conn, $query);

$num = filter_input(INPUT_GET, "num");
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

if (array_key_exists($num, $comp_dataset)) {
    $res['factor'] = $comp_dataset[$num]['factor'];
    if (array_key_exists('healthy1', $comp_dataset[$num])) {
        $res['location'] = $comp_dataset[$num]['location'];

        mysqli_stmt_bind_param($stmt, 'ss', $comp_dataset[$num]["healthy1"]["sensor_id"], $comp_dataset[$num]["healthy1"]["datetime"]);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $rows = mysqli_fetch_all($result, MYSQLI_ASSOC);
        $res['healthy1'] = $rows;
    }

    if (array_key_exists('healthy2', $comp_dataset[$num])) {
        mysqli_stmt_bind_param($stmt, 'ss', $comp_dataset[$num]["healthy2"]["sensor_id"], $comp_dataset[$num]["healthy2"]["datetime"]);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $rows = mysqli_fetch_all($result, MYSQLI_ASSOC);
        $res['healthy2'] = $rows;
    }

    if (array_key_exists('faulty', $comp_dataset[$num])) {
        mysqli_stmt_bind_param($stmt, 'ss', $comp_dataset[$num]["faulty"]["sensor_id"], $comp_dataset[$num]["faulty"]["datetime"]);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $rows = mysqli_fetch_all($result, MYSQLI_ASSOC);
        $res['faulty'] = $rows;
    }
} else {
        $res = array('error' => 'No Data');
}

echo json_encode($res);
mysqli_free_result($result);
mysqli_close($db_conn);

?>