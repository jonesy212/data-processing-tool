// TaskManagementSmartContract.sol

pragma solidity ^0.8.0;

contract TaskManagementSmartContract {
    struct Task {
        uint taskId;
        string taskTitle;
        string taskDescription;
        address assignedTo;
        bool completed;
    }

    mapping(uint => Task) public tasks;
    uint public taskCount;

    event TaskCreated(uint indexed taskId, string taskTitle);
    event TaskAssigned(uint indexed taskId, address indexed assignedTo);
    event TaskUpdated(uint indexed taskId, string taskTitle, bool completed);

    function createTask(string memory _taskTitle, string memory _taskDescription) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _taskTitle, _taskDescription, address(0), false);
        emit TaskCreated(taskCount, _taskTitle);
    }

    function assignTask(uint _taskId, address _assignedTo) public {
        require(tasks[_taskId].taskId != 0, "Task does not exist");
        tasks[_taskId].assignedTo = _assignedTo;
        emit TaskAssigned(_taskId, _assignedTo);
    }

    function updateTask(uint _taskId, string memory _taskTitle, bool _completed) public {
        require(tasks[_taskId].taskId != 0, "Task does not exist");
        tasks[_taskId].taskTitle = _taskTitle;
        tasks[_taskId].completed = _completed;
        emit TaskUpdated(_taskId, _taskTitle, _completed);
    }
}
