//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  Key Mappings
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Button key
const MOVE_RIGHT_KEY = ["D", "d", "Right", "ArrowRight"]
const MOVE_LEFT_KEY = ["A", "a", , "Left", "ArrowLeft"]
const MOVE_UP_KEY = ["W", "w", , "Up", "ArrowUp"]
const MOVE_DOWN_KEY = ["S", "s", "Down", "ArrowDown"]

// Shoot Key
const SHOOT_KEY = [" ", "Space"]

// Option keys
const SHUFFLE_KEY = ["J", "j"]
const HELP_KEY = ["H", "h"]
const CHAOS_NODE_KEY = ["K", "k"]
const CHAOS_POD_KEY = ["L", "l"]
const NAMESPACE_KEY = ["N", "n"]

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  Others
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var ballRadius = 7;
var x = canvas.width / 2;
var y = canvas.height - 30;
var dx = 2;
var dy = -2;
var spaceshipHeight = 60;
var spaceshipWidth = 60;
var spaceshipX = (canvas.width - spaceshipWidth) / 2;
var spaceshipY = (canvas.height - spaceshipHeight) / 2;
var clu_endpoint = "endpoint_placeholder";
var clu_insicure = "insecure_endpoint_placeholder";
var demo_mode = "platform_engineering_demo_mode_placeholder"
var k8s_url = "";
var chaos_report_post_data = "";

// when zoomIn is 12
var maxAliensPerRow = 20;
//var startYforHelp = 700;

const settings = {
    canvasSizes: {
        zoomIn: { width: 1200, height: 800, containerWidth: "100%", containerHeight: "100%", buttonWidth: "1200px" },
        zoomOut: { width: 720, height: 480, containerWidth: "50%", containerHeight: "50%", buttonWidth: "900px" }
    },
    textPositions: {
        startYforHelp: { zoomIn: 600, zoomOut: 280 },
        increment: 20
    },
    maxAliensPerRow: { zoomIn: 20, zoomOut: 12 },
};

if (clu_insicure == "true") {
    k8s_url = "http://" + clu_endpoint;
}
else {
    k8s_url = "https://" + clu_endpoint;
}

var namespaces = [];
var namespaces_index = 0;
var namespace = namespaces[namespaces_index];
var endpoint = "";
var modal_opened = false;
var autoPilot = false;
var autoPilotDirection = 0;
var spaceshipxOld = 0;
var randomFactor = 10;
// pods list from kubernetes
var pods = [];
var game_mode_switch = false;
var programming_mode_switch = false;
var now = "";
var game_buttons = document.getElementById("game-buttons");
var game_screen = document.getElementById("game-screen");
var chaos_program_screen = document.getElementById("chaos-program-screen");
var programming_mode_buttons = document.getElementById("programming-mode-buttons");
var log_tail_switch = false;
var log_tail_div = document.getElementById("logTailDiv");
var log_tail_screen = document.getElementById("logTailScreen");
var random_code = (Math.random() + 1).toString(36).substring(7);

// nodes list from kubernetes
var nodes = [];

// Hash of aliens related to pods or nodes
var aliens = [];
var aliensWidth = 40;
var aliensHeight = 40;

// Button vars
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

// The is true the rocket can move
var shot = false;

// Keep track of rocket launch
var rocketLaunched = false;

// Rocket position
var rocketX = -400;
var rocketY = -400;
var rocketSpeed = 7;

var collisionDetected = false;

// Aliens Vars. Keep track of Y positions where there is an alien.
var aliensY = [];
var aliensIncrementY = 50;

var shuffle = true;
var help = false;
var chaos_nodes = false;
var chaos_pods = true;
var log_tail_alert = '<div id="alert_placeholder3" style="margin-top: 2%; margin-bottom: 1%; background-color: #161616; color: #ffffff" class="alert" role="alert">';
var log_tail_alert_no_pixel = '<div id="alert_placeholder3" style="margin-top: 2%; margin-bottom: 1%; background-color: #161616; color: #ffffff; font-family: Courier, monospace;" class="alert" role="alert">';

var alert_div = '<div id="alert_placeholder" style="margin-top: 2%; margin-bottom: 1%; background-color: #161616; color: #ffffff" class="alert" role="alert">';
var alert_div_webtail = '<div id="alert_placeholder3" style="margin-top: 2%; background-color: #161616; color: #ffffff" class="alert" role="alert">';
var kubelinter = '';
var showPodName = true
var latestPodNameY = '';
var namespacesJumpFlag = false;
var namespacesJumpStatus = 'Disabled';
var latest_preset_name = "";
var latest_preset_lang = "";
var codename = getCodeName();
const codename_regex = /chaos-codename:\ [a-zA-Z_]*/g;
const chaos_job_regex = /chaos_jobs_status.*/g;
var codename_configured = false;
var chaos_jobs_status = new Map();
var current_color_mode = "light";
var chaos_logs_pos = 0;
var chaos_report_switch = false;
var chaos_report_http_elapsed_time_array = [];
var chaosReportprojectName = "";
var chaos_report_start_date = "";
var chart_deleted_pods_total = 0;
var chart_chaos_jobs_total = 0;
var chart_current_chaos_job_pod = 0;
var chart_pods_not_running_on = 0;
var chart_fewer_replicas_seconds = 0;
var chart_latest_fewer_replicas_seconds = 0;
var chart_status_code_dict = {
    "200": 1,
    "500": 1,
    "502": 1,
    "503": 1,
    "504": 1,
    "400": 1,
    "401": 1,
    "403": 1,
    "404": 1,
    "Connection Error": 1,
    "Other": 1
};

function getCodeName() {
    var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            codename = this.responseText.trim();
            if (codename == "") {
                $('#alert_placeholder').replaceWith(alert_div + 'Error getting codename from backend. </div>');
                codename = "error_fix_getcodename_from_backend";
            }
        }
    };;
    oReq.open("GET", k8s_url + "/codename");
    oReq.send();
}

function setCodeNameToTextInput(elementId) {
    var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            codename = this.responseText.trim();
            $("#" + elementId).val(codename);
            $("#" + elementId).text(codename);
            if (codename == "") {
                $('#alert_placeholder').replaceWith(alert_div + 'Error getting codename from backend. </div>');
                codename = "error_fix_getcodename_from_backend";
            }
        }
    };;
    oReq.open("GET", k8s_url + "/codename");
    oReq.send();
}

function getMetrics() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        var lines = this.responseText.split('\n');
        for (var i = 0; i < lines.length; i++) {
            metric = lines[i].split(' ');

            if (metric[0] == "chaos_node_jobs_total") {
                $('#chaos_jobs_total').text(metric[1]);
                chart_chaos_jobs_total = Number(metric[1]);
            }
            else if (metric[0] == "deleted_pods_total") {
                chart_deleted_pods_total = Number(metric[1]);
                $('#deleted_pods_total').text(metric[1]);
            }
            else if (metric[0] == "fewer_replicas_seconds") {
                chart_fewer_replicas_seconds = Number(metric[1]);
                $('#fewer_replicas_seconds').text(metric[1]);
            }
            else if (metric[0] == "latest_fewer_replicas_seconds") {
                chart_latest_fewer_replicas_seconds = Number(metric[1]);
                $('#latest_fewer_replicas_seconds').text(metric[1]);
            }
            else if (metric[0] == "pods_not_running_on_selected_ns") {
                chart_pods_not_running_on = Number(metric[1]);
                $('#pods_not_running_on').text(metric[1]);
            }
            else if (metric[0] == "pods_match_regex:" + random_code) {
                $('#pods_match_regex').text(metric[1]);
            }
            else if (metric[0].match(chaos_job_regex)) {
                metrics_split = metric[0].split(":");
                chaos_jobs_status.set(metrics_split[1] + ":" + metrics_split[2] + ":" + metrics_split[3], metric[1]);
            }
            else if (metric[0] == "current_chaos_job_pod") {
                chart_current_chaos_job_pod = Number(metric[1]);
                $('#current_chaos_job_pod').text(metric[1]);
            }
        }
    };;
    oReq.open("GET", k8s_url + "/metrics");
    oReq.send();
}

function scroll_backwards() {
    if (chaos_logs_pos > 0) {
        chaos_logs_pos = chaos_logs_pos - 1;
        $('#current_log_pos').text(chaos_logs_pos);
        getChaosJobsLogs();
    }
}

function getTotalLogsPos() {
    var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            if (log_tail_switch) {
                if (this.responseText.trim() == "null") {
                    $('#total_logs_pos').text("0");
                } else {
                    $('#total_logs_pos').text(this.responseText);
                }
            }
        }
    };;
    oReq.open("GET", k8s_url + "/chaos/logs/count?logid=" + random_code);
    oReq.send();
}

function scroll_forward() {
    chaos_logs_pos = chaos_logs_pos + 1;
    $('#current_log_pos').text(chaos_logs_pos);
    getChaosJobsLogs();
}

function getChaosJobsLogs() {
    var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            if (log_tail_switch) {
                if (this.responseText.trim() == "null") {
                    document.getElementById("logTailDiv").innerHTML = "Logs has been cleaned...";
                } else {
                    document.getElementById("logTailDiv").innerHTML = "";
                    document.getElementById("logTailDiv").innerHTML = this.responseText;
                }
            }
        }
    };;
    oReq.open("GET", k8s_url + "/chaos/logs?logid=" + random_code + "&pos=" + chaos_logs_pos);
    oReq.send();
    keepAliveJobsLogs();
}

function keepAliveJobsLogs() {
    var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            if (!this.responseText.toLowerCase().match(/.*null.*/)) {
                $('#alert_placeholder3').replaceWith(log_tail_alert_no_pixel + this.responseText.replace("nil", "") + '</div>');
            }
        }
    };;
    oReq.open("GET", k8s_url + "/chaos/logs/keepalive?logid=" + random_code + "&pos=" + chaos_logs_pos);
    oReq.send();
}

function runKubeLinter() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        kubelinter = this.responseText;
        $('#alert_placeholder').replaceWith(alert_div + "KubeLinter executed correctly on namespace " + namespace + ". Changing Regex and activating logs tail.</div>");
        enableLogTail();
        setLogRegex();

        $('#logTailRegex').val('{"since": "60", "pod":".*", "namespace":"' + namespace + '", "labels":".*", "annotations":".*", "containers":".*"}');

        if (!log_tail_switch) {
            setLogConsole();
        }
    };;

    $('#currentKubeLinterResult').text('KubeLinter launched. Set this regex and start log tail: {"since": "60", "pod":".*", "namespace":"' + namespace + '", "labels":".*", "annotations":".*", "containers":".*"}');

    oReq.open("GET", k8s_url + "/kube/kube-linter?logid=" + random_code + "&namespace=" + namespace);
    oReq.send();
}

function getNamespaces() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        namespaces = this.responseText;
        namespaces = namespaces.split(",");
        namespace = namespaces[namespaces_index];
        console.log("[CURRENT-NAMESPACE] " + namespace);
        $('#currentGameNamespace').text(namespace);
    };;
    oReq.open("GET", k8s_url + "/kube/namespaces");
    oReq.send();
}

function getEndpoint() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        endpoint = this.responseText;
    };;
    oReq.open("GET", k8s_url + "/kube/endpoint");
    oReq.send();
}

function getCurrentChaosContainer() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        job_parsed = JSON.stringify(JSON.parse(this.responseText), null, 4);
        $('#currentChaosContainerYaml').text(job_parsed);
        $('#currentChaosContainerJsonTextArea').val(job_parsed);
    };;
    oReq.open("GET", k8s_url + "/kube/chaos/containers?action=container_definition");
    oReq.send();
}

function enableLogTail() {
    var oReq = new XMLHttpRequest();
    oReq.open("POST", k8s_url + "/kube/chaos/containers?action=enable_log_tail&id=" + random_code, true);
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            $('#alert_placeholder3').replaceWith(log_tail_alert + 'Logs tail started </div>');
        }
    };;
    oReq.setRequestHeader("Content-Type", "application/json");
    oReq.send("{}");
    setLogRegex();
}

function disableLogTail() {
    var oReq = new XMLHttpRequest();
    oReq.open("POST", k8s_url + "/kube/chaos/containers?action=disable_log_tail&id=" + random_code, true);
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            $('#alert_placeholder3').replaceWith(log_tail_alert + 'Logs tail stopped </div>');
        }
    };;
    oReq.setRequestHeader("Content-Type", "application/json");
    // TODO: send payload for auth...
    oReq.send("foobar");
}

function setLogRegex() {
    log_tail_div.style.display = "block";
    $('#alert_placeholder3').replaceWith(log_tail_alert + 'Setting regex for filtering log source (by pod name)</div>');
    var oReq = new XMLHttpRequest();
    oReq.open("POST", k8s_url + "/kube/chaos/containers?action=set_log_regex&id=" + random_code, true);
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            $('#alert_placeholder3').replaceWith(log_tail_alert + 'New regex has been configured</div>');
        }
    };;
    oReq.setRequestHeader("Content-Type", "application/json");
    oReq.send($('#logTailRegex').val());
}

function setChaosContainer() {
    if (!IsJsonString($('#currentChaosContainerJsonTextArea').val())) {
        $('#alert_placeholder2').text('JSON syntax not valid.');
    }
    else {
        var oReq = new XMLHttpRequest();
        oReq.open("POST", k8s_url + "/kube/chaos/containers?action=set", true);

        oReq.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                $('#alert_placeholder2').text('New container definition has been saved.');
            }
        };;
        oReq.setRequestHeader("Content-Type", "application/json");
        oReq.send($('#currentChaosContainerJsonTextArea').val());
    }
}

function startChaosNode(node_name) {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Launched chaos job against ' + node_name + '</div>');
    };;
    $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Start chaos job against ' + node_name + '</div>');
    oReq.open("GET", k8s_url + "/kube/chaos/nodes?nodename=" + node_name + "&namespace=" + namespace);
    oReq.send();
}

function deletePods(pod_name) {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Kill ' + pod_name + '</div>');
    };;
    oReq.open("GET", k8s_url + "/kube/pods?action=delete&pod_name=" + pod_name + "&namespace=" + namespace);
    oReq.send();
}

function getPods() {
    if (chaos_pods) {
        var oReq = new XMLHttpRequest();
        oReq.onload = function () {
            new_pods = JSON.parse(this.responseText)["items"];

            // Pod might just be killed in game, but not terminated in k8s yet.
            for (i = 0; i < new_pods.length; i++) {
                if (aliens.some((alien) => alien.name == new_pods[i].name && alien.status == "killed")) {
                    new_pods[i].status = "killed";
                }
            }

            if (nodes && nodes.length > 0) {
                pods = new_pods.concat(nodes);
            } else {
                pods = new_pods;
            }
        };;
        oReq.open("GET", k8s_url + "/kube/pods?action=list&namespace=" + namespace);
        oReq.send();
    }
    else {
        if (nodes && nodes.length > 0) {
            pods = nodes;
        } else {
            pods = [];
        }
    }
}

function getNodes() {
    if (chaos_nodes) {
        var oReq = new XMLHttpRequest();
        oReq.onload = function () {
            json_parsed = JSON.parse(this.responseText);
            nodes = json_parsed["items"];
        };;
        oReq.open("GET", k8s_url + "/kube/nodes");
        oReq.send();
    }
    else {
        nodes = []
    }
}

window.setInterval(function getKubeItems() {
    if (game_mode_switch) {
        getNodes();
        getPods();
    }
}, 500)

function isRightKeyPressed(eventKey) {
    return MOVE_RIGHT_KEY.includes(eventKey);
}

function isLeftKeyPressed(eventKey) {
    return MOVE_LEFT_KEY.includes(eventKey);
}

function isUpKeyPressed(eventKey) {
    return MOVE_UP_KEY.includes(eventKey);
}

function isDownKeyPressed(eventKey) {
    return MOVE_DOWN_KEY.includes(eventKey);
}

function isShootKeyPressed(eventKey) {
    return SHOOT_KEY.includes(eventKey);
}

function isShuffleKeyPressed(eventKey) {
    return SHUFFLE_KEY.includes(eventKey);
}

function isHelpKeyPressed(eventKey) {
    return HELP_KEY.includes(eventKey);
}

function isChaosNodeKeyPressed(eventKey) {
    return CHAOS_NODE_KEY.includes(eventKey);
}

function isChaosPodKeyPressed(eventKey) {
    return CHAOS_POD_KEY.includes(eventKey);
}

function isNamespacesKeyPressed(eventKey) {
    return NAMESPACE_KEY.includes(eventKey);
}

function keyDownHandler(e) {
    if (!modal_opened && game_mode_switch) {
        e.preventDefault();

        rightPressed = isRightKeyPressed(e.key);
        leftPressed = isLeftKeyPressed(e.key);
        upPressed = isUpKeyPressed(e.key);
        downPressed = isDownKeyPressed(e.key);
        shot = isShootKeyPressed(e.key);

        handleToggleableActions(e)
    }
}

function keyUpHandler(e) {

    if (isRightKeyPressed(e.key)) {
        rightPressed = false;
    }
    if (isLeftKeyPressed(e.key)) {
        leftPressed = false;
    }
    if (isUpKeyPressed(e.key)) {
        upPressed = false;
    }
    if (isDownKeyPressed(e.key)) {
        downPressed = false;
    }
}

function handleToggleableActions(e) {
    if (isShuffleKeyPressed(e.key)) {
        toggleAction(toggleShuffle, 'Shuffle');
    }
    else if (isNamespacesKeyPressed(e.key)) {
        switchNamespace();
    }
    else if (isHelpKeyPressed(e.key)) {
        toggleAction(toggleHelp, 'Help');
    }
    else if (isChaosNodeKeyPressed(e.key)) {
        toggleAction(toggleChaosNodes, 'Hide nodes', 'Show nodes');
    }
    else if (isChaosPodKeyPressed(e.key)) {
        toggleAction(toggleChaosPods, 'Hide pods', 'Show pods');
    }
}

function toggleAction(toggleFunction, actionName, alternativeActionName) {
    const currentState = toggleFunction();
    if (alternativeActionName) {
        const displayAction = currentState ? actionName : alternativeActionName
        return updateUI(displayAction);
    } else {
        const displayAction = (currentState ? `Enabled` : `Disabled`) + ` ${actionName}`;
        return updateUI(displayAction);
    }
}

function updateUI(message) {
    $('#alert_placeholder').replaceWith(alert_div + 'Latest action: ' + message + '</div>');
}

function toggleShuffle() {
    shuffle = !shuffle;
    return shuffle;
}

function toggleHelp() {
    help = !help;
    return help;
}

function toggleChaosNodes() {
    chaos_nodes = !chaos_nodes;
    return chaos_nodes;
}

function toggleChaosPods() {
    chaos_pods = !chaos_pods;
    return chaos_pods;
}

function keyUpHandler(e) {

    if (isRightKeyPressed(e.key)) {
        rightPressed = false;
    }
    if (isLeftKeyPressed(e.key)) {
        leftPressed = false;
    }
    if (isUpKeyPressed(e.key)) {
        upPressed = false;
    }
    if (isDownKeyPressed(e.key)) {
        downPressed = false;
    }
}

function drawAlien(alienX, alienY, name, status) {
    var image = new Image(); // Image constructor
    if (nodes.some((node) => node.name == name)) {
        image.src = './images/k8s_node.png';
        ctx.drawImage(image, alienX, alienY, 30, 40);
    }
    else {
        image.src = `./images/sprite_invader_${status}.png`;
        ctx.font = '8px pixel';
        ctx.drawImage(image, alienX, alienY, 40, 40);
        if (showPodName) {
            ctx.fillText(name.substring(0, 19) + '..', alienX, alienY + 40);
        }
    }
    ctx.closePath();
}

function checkRocketAlienCollision() {
    if (contains(aliensY, rocketY)) {
        var i;
        for (i = aliens.length - 1; i >= 0; i--) {
            if (aliens[i]["active"] && (rocketY - aliens[i]["y"] < 5)) {
                var rangeX = []
                rangeX.push(aliens[i]["x"]);

                for (k = aliens[i]["x"]; k < aliens[i]["x"] + aliensWidth; k++) {
                    rangeX.push(k);
                }

                if (contains(rangeX, rocketX)) {
                    collisionDetected = true;
                    aliens[i]["status"] = "killed";
                    // Aliens might be updated before new pods are fetched
                    for (j = 0; j < pods.length; j++) {
                        if (pods[j].name == aliens[i].name) {
                            pods[j].status = "killed";
                        }
                    }
                    if (nodes.some((node) => node.name == aliens[i]["name"])) {
                        aliens[i]["active"] = false;
                        startChaosNode(aliens[i]["name"]);
                    }
                    else {
                        deletePods(aliens[i]["name"]);
                    }
                    return true;
                }
            }
        }
    }
    return false;
}

function shuffleAliens() {
    pods = pods.sort(() => Math.random() - 0.5)
}

function drawRocket() {
    var image = new Image(); // Image constructor
    image.src = './images/kuberocket.png';
    ctx.drawImage(image, rocketX, rocketY, 20, 20);
    ctx.closePath();

    if (checkRocketAlienCollision()) {
        rocketY = -100;
        rocketX = -100;
        collisionDetected = false;
        return
    }

    if (shot && rocketLaunched) {
        if (rocketY < 0) {
            shot = false;
            rocketLaunched = false;
        }
        else {
            rocketY = rocketY -= rocketSpeed;
        }
    }
    else {
        rocketX = spaceshipX + (spaceshipWidth / 3);
        rocketY = spaceshipY;
        rocketLaunched = true
    }
}

function drawSpaceship() {
    var image = new Image(); // Image constructor
    image.src = './images/spaceship.png';
    ctx.drawImage(image, spaceshipX, spaceshipY, 60, 60);
    ctx.closePath();
}

window.setInterval(function draw() {
    if (namespacesJumpFlag) {
        randNamespaceJump(1, 10, 8);
    }
}, 1000)

window.setInterval(function draw() {

    console.log(spaceshipX)
    console.log(spaceshipY)

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (i = 0; i < aliens.length; i++) {
        if (aliens[i]["active"]) {
            drawAlien(aliens[i]["x"], aliens[i]["y"], aliens[i]["name"], aliens[i]["status"]);
        }
    }
    if (changed == true) {
        if (zoomLevel == "zoomIn") {
            spaceshipX = spaceshipX * (settings.canvasSizes["zoomIn"].width / settings.canvasSizes["zoomOut"].width)
            spaceshipY = spaceshipY * (settings.canvasSizes["zoomIn"].height / settings.canvasSizes["zoomOut"].height)
        } else {
            spaceshipX = spaceshipX * (settings.canvasSizes["zoomOut"].width / settings.canvasSizes["zoomIn"].width)
            spaceshipY = spaceshipY * (settings.canvasSizes["zoomOut"].height / settings.canvasSizes["zoomIn"].height)
        }
        changed = false;
    }


    drawSpaceship();

    if (shot && !collisionDetected) {
        drawRocket();
    }

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
        dy = -dy;
    }

    if (autoPilot) {
        spaceshipY = 340;

        if (getRandomInt(100) < randomFactor) {
            shot = true;
        }

        if (autoPilotDirection == 0) {
            autoPilotDirection = getRandomInt(canvas.width - spaceshipWidth);
            spaceshipxOld = spaceshipX;
        }
        else if ((spaceshipX == autoPilotDirection)) {
            autoPilotDirection = getRandomInt(canvas.width - spaceshipWidth);
            spaceshipxOld = spaceshipX;
        }
        else if ((autoPilotDirection < spaceshipxOld) && (spaceshipX < autoPilotDirection)) {
            autoPilotDirection = getRandomInt(canvas.width - spaceshipWidth);
            spaceshipxOld = spaceshipX;
        }
        else if ((autoPilotDirection > spaceshipxOld) && (spaceshipX > autoPilotDirection)) {
            autoPilotDirection = getRandomInt(canvas.width - spaceshipWidth);
            spaceshipxOld = spaceshipX;
        }
        else {
            if (autoPilotDirection > spaceshipX) {
                spaceshipX += 5;
            }
            else {
                spaceshipX -= 5;
            }
        }
    }

    if (rightPressed) {
        spaceshipX += 3;
        if (spaceshipX + spaceshipWidth > canvas.width) {
            spaceshipX = canvas.width - spaceshipWidth;
        }
    }
    else if (leftPressed) {
        spaceshipX -= 3;
        if (spaceshipX < 0) {
            spaceshipX = 0;
        }
    }

    if (upPressed) {
        spaceshipY -= 3;
        if (spaceshipY < 0) {
            spaceshipY = 0;
        }
    }

    else if (downPressed) {
        spaceshipY += 3;
        if (spaceshipY + spaceshipHeight > canvas.height) {
            spaceshipY = canvas.height - spaceshipHeight;
        }
    }

    // if (aliens_temp != aliens) {
    //     for (i=0; i<aliens.length; i++) {
    //         if (aliens[i]["active"]) {
    //             drawAlien(aliens[i]["x"], aliens[i]["y"], aliens[i]["name"], aliens[i]["status"]);
    //         }
    //     }
    //     aliens_temp = aliens;
    // }

    ctx.fillStyle = 'white';
    ctx.font = '16px pixel';
    updateCanvasText(ctx, help);

}, 10)

function renderText(ctx, texts, startY) {
    texts.forEach((text, index) => {
        ctx.fillText(text.content, 10, startY + (index * settings.textPositions.increment));
    });
}

function updateCanvasText(ctx, help) {
    const texts = [
        { content: 'Cluster: ' + endpoint },
        { content: 'Current Namespace: ' + namespace },
        { content: 'Alien Shuffle: ' + shuffle },
        { content: 'Auto Namespaces Switch: ' + namespacesJumpStatus },
        { content: `press '${HELP_KEY[0]}' for help!` }
    ];

    if (help) {
        texts.push(...[
            { content: `${HELP_KEY[0]} => Activate or deactivate help` },
            { content: `${SHUFFLE_KEY[0]} => Activate or deactivate shuffle for aliens` },
            { content: `${NAMESPACE_KEY[0]} => Change namespace` },
            { content: `${CHAOS_POD_KEY[0]} => Activate or deactivate chaos engineering against pods` },
            { content: `${CHAOS_NODE_KEY[0]} => Activate or deactivate chaos engineering against nodes` }
        ]);
    }
    renderText(ctx, texts, settings.textPositions.startYforHelp[zoomLevel]);
}

function buttonShuffleHelper() {
    if (shuffle) {
        shuffle = false;
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Shuffle Disable</div>');
        $("#buttonShuffle").text("Enable Shuffle");
    }
    else {
        shuffle = true
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Shuffle Enabled</div>');
        $("#buttonShuffle").text("Disable Shuffle");
    }
}

function namespacesJumpControl() {
    if (namespacesJumpFlag) {
        namespacesJumpFlag = false;
        $("#namespacesJumpButton").text("Enable Auto NS Switch");
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Disabled automatic switch of namespace</div>');
        namespacesJumpStatus = 'Disabled'
    } else {
        namespacesJumpFlag = true;
        $("#namespacesJumpButton").text("Disable Auto NS Switch");
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Enabled automatic switch of namespace </div>');
        namespacesJumpStatus = 'Enabled'
    }
}

function showPodNameControl() {
    if (showPodName) {
        showPodName = false;
        $("#buttonOnlyPodName").text("Show Pods Name");
    }
    else {
        showPodName = true
        $("#buttonOnlyPodName").text("Hide Pods Name");
    }
}

function podExists(podName) {
    for (i = 0; i < aliens.length; i++) {
        if (aliens[i]["name"] == podName) {
            return true;
        }
    }
    return false;
}

function findReplace() {
    for (i = 0; i < aliens.length; i++) {
        if (!aliens[i]["active"]) {
            return i;
        }
    }
    return -1;
}

function randNamespaceJump(min, max, jumpRandomFactor) {
    if ((Math.random() * (max - min) + min) > jumpRandomFactor) {
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Switch Namespace</div>');
        switchNamespace();
    }
}

window.setInterval(function setAliens() {
    if (shuffle) {
        pods = pods.sort(() => Math.random() - 0.5)
    }

    aliens = [];
    if (pods.length > 0) {
        for (k = 10; k > 0; k--) {
            if (!contains(aliensY, k)) {
                aliensY.push(k);
            }
        }
        var x = 10;
        var y = 10;
        var yInc = false;

        for (i = 0; i < pods.length; i++) {
            if (!podExists(pods[i].name)) {
                var replaceWith = findReplace();
                if (replaceWith != -1) {
                    aliens[replaceWith] = { "name": pods[i].name, "status": pods[i].status, "x": aliens[replaceWith]["x"], "y": aliens[replaceWith]["y"], "active": true }
                    cnt = + 1;
                }
                else {
                    if (!yInc) {
                        y += 20;
                        yInc = true;
                    }
                    else {
                        y -= 20;
                        yInc = false;
                    }
                    aliens.push({ "name": pods[i].name, "status": pods[i].status, "x": x, "y": y, "active": true });
                    cnt = + 1;
                }
                if (aliens.length % maxAliensPerRow == 0) {
                    x = 10;
                    y += aliensIncrementY;
                    for (k = y + 10; k >= y; k--) {
                        if (!contains(aliensY, k)) {
                            aliensY.push(k);
                        }
                    }
                }
                else {
                    x += 60;
                }
            }
        }
    }
}, 1000)

window.setInterval(function backgroundTasks() {

    if (!codename_configured) {
        chaosProgram = $('#chaosProgramTextArea').val();
        chaosProgramWithCodename = chaosProgram.replace(codename_regex, "chaos-codename: " + codename);
        $('#chaosProgramTextArea').val(chaosProgramWithCodename);
        codename_configured = true;
    }

    if (game_mode_switch || programming_mode_switch || log_tail_switch) {
        getMetrics();
        updateMainMetricsChart();
    }

    if (log_tail_switch) {
        getChaosJobsLogs();
        getTotalLogsPos();
    }

    if (programming_mode_switch) {
        drawChaosProgramFlow();
    }

    if (chaos_report_switch) {
        updateElapsedTimeArray(chaosReportprojectName);
        updateChaosReportStartTime(chaosReportprojectName);
        drawCanvasHTTPStatusCodeStats();
        chaosReportKeepAlive(chaosReportprojectName);
    }

}, 2000)

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

getEndpoint();
getNamespaces();
getSavedPresets();

document.getElementById("gameContainer").style.visibility = "hidden";
document.getElementById("metricsPresetsRow").style.visibility = "hidden";
document.getElementById("gameContainer").style.opacity = 0;
document.getElementById("metricsPresetsRow").style.opacity = 0;
document.getElementById("gameContainer").style.visibility = "visible";
document.getElementById("metricsPresetsRow").style.visibility = "visible";
document.getElementById("gameContainer").style.opacity = 1;
document.getElementById("metricsPresetsRow").style.opacity = 1;
var helpMenuBody = document.getElementById('help-menu-body');
helpMenuBody.innerHTML = `
        ${HELP_KEY[0]} => Activate or deactivate help<br>
        ${SHUFFLE_KEY[0]} => Activate or deactivate shuffle for aliens<br>
        ${NAMESPACE_KEY[0]} => Change namespace<br>
        ${CHAOS_POD_KEY[0]} => Activate or deactivate chaos engineering against pods<br>
        ${CHAOS_NODE_KEY[0]} => Activate or deactivate chaos engineering against nodes`;
