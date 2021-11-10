recalculateServiceTime()
$(".priority-only").hide()

$(document).ready(function () {
	$("input[type=radio][name=algorithm]").change(function () {
		if (this.value == "priority") {
			$(".priority-only").show()
			//$(".servtime").show()
			$("#minus").css("left", "582px")
		}
		recalculateServiceTime()
	})

	$("#priority").click()
})

function addRow() {
	var lastRow = $("#inputTable tr:last")
	var lastRowNumebr = parseInt(lastRow.children()[1].innerText)

	var newRow =
		"<tr><td>P" +
		(lastRowNumebr + 1) +
		"</td><td>" +
		(lastRowNumebr + 1) +
		'</td><td><input class="exectime" type="text"/></td><td style="display:none" class="servtime"></td>' +
		'<td class="priority-only"><input type="text"/></td></tr>'

	lastRow.after(newRow)

	var minus = $("#minus")
	minus.show()
	minus.css("top", parseFloat(minus.css("top")) + 29.5 + "px")

	if ($("input[name=algorithm]:checked", "#algorithm").val() != "priority")
		$(".priority-only").hide()

	$("#inputTable tr:last input").change(function () {
		recalculateServiceTime()
	})
}

function deleteRow() {
	var lastRow = $("#inputTable tr:last")
	lastRow.remove()

	var minus = $("#minus")
	minus.css("top", parseFloat(minus.css("top")) - 29.5 + "px")

	if (parseFloat(minus.css("top")) < 150) minus.hide()
}

$(".initial").change(function () {
	recalculateServiceTime()
})

function recalculateServiceTime() {
	var inputTable = $("#inputTable tr")
	var totalExectuteTime = 0

	var algorithm = $("input[name=algorithm]:checked", "#algorithm").val()
	if (algorithm == "priority") {
		var exectuteTimes = []
		var priorities = []

		$.each(inputTable, function (key, value) {
			if (key == 0) return true
			exectuteTimes[key - 1] = parseInt(
				$(value.children[2]).children().first().val()
			)
			priorities[key - 1] = parseInt(
				$(value.children[4]).children().first().val()
			)
		})

		var currentIndex = -1
		for (var i = 0; i < exectuteTimes.length; i++) {
			currentIndex = findNextIndexWithPriority(currentIndex, priorities)

			if (currentIndex == -1) return

			$(inputTable[currentIndex + 1].children[3]).text(totalExectuteTime)

			totalExectuteTime += exectuteTimes[currentIndex]
		}
	} 
}

function findNextIndexWithPriority(currentIndex, priorities) {
	var currentPriority = 1000000
	if (currentIndex != -1) currentPriority = priorities[currentIndex]
	var resultPriority = 0
	var resultIndex = -1
	var samePriority = false
	var areWeThereYet = false

	$.each(priorities, function (key, value) {
		var changeInThisIteration = false

		if (key == currentIndex) {
			areWeThereYet = true
			return true
		}
		if (value <= currentPriority && value >= resultPriority) {
			if (value == resultPriority) {
				if (currentPriority == value && !samePriority) {
					samePriority = true
					changeInThisIteration = true
					resultPriority = value
					resultIndex = key
				}
			} else if (value == currentPriority) {
				if (areWeThereYet) {
					samePriority = true
					areWeThereYet = false
					changeInThisIteration = true
					resultPriority = value
					resultIndex = key
				}
			} else {
				resultPriority = value
				resultIndex = key
			}

			if (value > resultPriority && !changeInThisIteration) samePriority = false
		}
	})
	return resultIndex
}

function findNextIndex(currentIndex, array) {
	var currentTime = 0
	if (currentIndex != -1) currentTime = array[currentIndex]
	var resultTime = 1000000
	var resultIndex = -1
	var sameTime = false
	var areWeThereYet = false

	$.each(array, function (key, value) {
		var changeInThisIteration = false

		if (key == currentIndex) {
			areWeThereYet = true
			return true
		}
		if (value >= currentTime && value <= resultTime) {
			if (value == resultTime) {
				if (currentTime == value && !sameTime) {
					sameTime = true
					changeInThisIteration = true
					resultTime = value
					resultIndex = key
				}
			} else if (value == currentTime) {
				if (areWeThereYet) {
					sameTime = true
					areWeThereYet = false
					changeInThisIteration = true
					resultTime = value
					resultIndex = key
				}
			} else {
				resultTime = value
				resultIndex = key
			}

			if (value < resultTime && !changeInThisIteration) sameTime = false
		}
	})
	return resultIndex
}

function animate() {
	$("fresh").prepend(
		'<div id="curtain" style="position: absolute; right: 0; width:100%; height:100px;"></div>'
	)

	$("#curtain").width($("#resultTable").width())
	$("#curtain").css({ left: $("#resultTable").position().left })

	var sum = 0
	$(".exectime").each(function () {
		sum += Number($(this).val())
	})

	var distance = $("#curtain").css("width")

	animationStep(sum, 0)
	jQuery("#curtain").animate({ width: "0", marginLeft: distance }, (sum * 1000) / 2, "linear")
}

function animationStep(steps, cur) {
	$("#timer").html(cur)
	if (cur < steps) {
		setTimeout(function () {
			animationStep(steps, cur + 1)
		}, 500)
	} else {
	}
}

function draw() {
	$("fresh").html("")
	var inputTable = $("#inputTable tr")
	var th = ""
	var td = ""
	var executeTimes = []
	var algorithm = $("input[name=algorithm]:checked", "#algorithm").val()

	if (algorithm == "priority") {

		$.each(inputTable, function (key, value) {
			if (key == 0) return true
			var executeTime = parseInt($(value.children[2]).children().first().val())
			var priority = parseInt($(value.children[4]).children().first().val())
			executeTimes[key - 1] = {
				executeTime: executeTime,
				P: key - 1,
				priority: priority
			}
		})

		//Sort priority
		executeTimes.sort(function (a, b) {
			if (a.priority == b.priority) return a.P - b.P
			return a.priority - b.priority
		})

		$.each(executeTimes, function (key, value) {
			value.P += 1
			th +=
				'<th style="text-align: center;height: 60px; width: ' +
				value.executeTime * 20 +
				'px;">P' +
				value.P +
				"</th>"
			td += "<td style='text-align: center;'>" + value.executeTime + "</td>"
		})

		//Calc avg waitting time
		let sum = 0
		for (let i = 0; i < executeTimes.length - 1; i++) {
			for (let j = 0; j <= i; j++) {
				sum += executeTimes[j].executeTime
			}
		}
		$("#waiting-time").append(`${sum / executeTimes.length}`)
		
		//Show table
		$("fresh").html(
			`<table id="resultTable" style="width: 70%">${th}</tr><tr>${td}</tr></table>`
		)
	}
	animate()
}
