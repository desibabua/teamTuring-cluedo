'use strict';

const paths = require('../data/paths');
const rooms = require('../data/roomDetails');

const findNextPositions = function(position, movedPosition) {
  const [x, y] = position.split('_');
  const nextPos = [
    `${+x - 1}_${y}`,
    `${x}_${+y - 1}`,
    `${+x + 1}_${y}`,
    `${x}_${+y + 1}`
  ];
  return nextPos.filter(
    pos => paths.includes(pos) && !movedPosition.includes(pos)
  );
};

const getUniqueValues = data => {
  return data.reduce(
    (values, newValue) =>
      values.includes(newValue) ? values : values.concat(newValue),
    []
  );
};

const getPossibleRoom = function(position, diceValue, movedPosition) {
  if (diceValue > 0) {
    return Object.keys(rooms).filter(
      room =>
        rooms[room].entrance.includes(position) && !movedPosition.includes(room)
    );
  }
  return [];
};

const findPossiblePaths = function(diceValue, position, movedPosition) {
  movedPosition.push(position);
  let possiblePosition = getPossibleRoom(position, diceValue, movedPosition);
  if (diceValue === 0) {
    return [position];
  }
  const nextPossiblePos = findNextPositions(position, movedPosition);
  nextPossiblePos.forEach(pos => {
    possiblePosition = possiblePosition.concat(
      findPossiblePaths(diceValue - 1, pos, movedPosition.slice())
    );
  });
  return getUniqueValues(possiblePosition);
};

const checkEntranceAndMove = function(diceValue, entrance, invalidPos) {
  if (invalidPos.includes(entrance)) {
    return [];
  }
  return findPossiblePaths(diceValue, entrance, invalidPos);
};

const getValidPositions = (allPlayersPosition, player, diceValue) => {
  let validPositions = [];
  if (player.position in rooms) {
    const door = rooms[player.position].door;
    door.forEach((door, index) => {
      validPositions = validPositions.concat(
        checkEntranceAndMove(
          diceValue - 1,
          rooms[player.position].entrance[index],
          allPlayersPosition.concat(player.position)
        )
      );
    });
    return validPositions;
  }
  return findPossiblePaths(diceValue, player.position, allPlayersPosition);
};

module.exports = { getValidPositions };
