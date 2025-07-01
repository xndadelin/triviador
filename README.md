the game is simple

players join a room and start on a shared map
to conquer a territory, you attack it
you and the defender get a trivia question
the faster and more accurate answer wins the fight
you expand, defend, or lose land based on your answers
whoever controls the most territory in the end wins


the flow
1. users loggon and they can either join or create a room (room.status = pending)
2. when the host feels like there are enough players, it can start (room.status = active)
3. the map will generate and attribute territories of the country to players
4. all players will see the map synchronously, listening to changes on room/map_state
5. the active player will select a territory to attack
6. there is going to be an entry in the table attacks with (attacker, defender, territory, question_id)
7. the attacker and the defender will receive the trivia question (synchronously), but only they can answer, the others can only see
8. they both send the answer, and it will be check (also time will be counted)
9. the map will update depending on answers
10. repeat
11. when all rounds will be finished, the winner will be the one with the most points

