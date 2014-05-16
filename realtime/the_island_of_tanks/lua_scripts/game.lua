local angles = {}
local factor = 2

local TANK_LEFT    = 1
local TANK_TOP     = 2
local TANK_RIGHT   = 4
local TANK_BOTTOM  = 8
local TURRET_LEFT  = 16
local TURRET_RIGHT = 32
local FIRE         = 64

--[[ MAP CONSTANTS (tile size: 32 x 32) ]]--
local seed             = 0
local match_duration   = 0
local match_timer      = nil
local tile_size        = 32/factor  -- in pixels
local viewport_x       = 40*factor  -- (* tile_size) pixels
local viewport_y       = 30*factor  -- (* tile_size) pxiels
local map_width        = 240        -- (viewport_x * 8) pixels
local map_height       = 180        -- (viewport_y * 8) pixels
local noise_factor     = 0.1 / 4
local water_threshold  = -0.5
local grass_threshold  = 0.6


--[[ PLAYER CONSTANTS ]]--
local tank_shield            = 5
local tank_max_speed         = 32/factor  -- in pixels/tick
local tank_acceleration      = 4/factor   -- in pixels/tick
local tank_max_reverse_speed = -24/factor -- in pixels/tick
local tank_breaking_speed    = -4/factor  -- in pixels/tick

local tank_pulsatance   = math.pi/16 -- in radian/tick
local turret_pulsatance = math.pi/8  -- in radian/tick
local shell_start_speed = 96/factor  -- in pixels/tick
local shell_min_speed   = 64/factor  -- in pixels/tick
local shell_acceleration= -2/factor  -- in pixels/tick
local shell_dammage     = 2
local collision_dammage = 2
local shot_ttl          = 10         -- in tick
local respawn_ttl       = 20         -- in tick

local SimplexNoise = dofile(reflex.script_path .. "/simplex.lua")
local players = {}
local shells  = {}

function is_walkable(x, y)
   x = x / tile_size
   y = y / tile_size
   local x1 = x - map_width/2
   local y1 = y - map_height/2
   local p  = math.pow(x1 / (map_width/2 - 8), 2) + math.pow(y1 / (map_height/2 - 6), 2)
   if p >= 1 then
      return false;
   end

   local level = SimplexNoise.Noise2D(x * noise_factor, y * noise_factor)
   if level < water_threshold then
      return false
   else
      return true
   end
end

function new_player_position()
   local x = math.random(viewport_x * tile_size, (map_width-viewport_x) * tile_size)
   local y = math.random(viewport_y * tile_size, (map_height-viewport_y) * tile_size)
   while not is_walkable(x, y) do
      x = math.random(viewport_x * tile_size, (map_width-viewport_x) * tile_size)
      y = math.random(viewport_y * tile_size, (map_height-viewport_y) * tile_size)
   end

   return x,y
end

function new_player(id)
   local x,y = new_player_position()
   return {id = id,
           x             = x,
           y             = y,
           u             = 0,
           v             = 0,
           speed         = 0,
           tank_pos      = 0,
           turret_pos    = 0,
           shot_ttl      = 0,
           shield        = tank_shield,
           key_pressed   = 0,
           respawn_ttl   = 0,
           frags         = 0,
           hits          = 0,
           deaths        = 0,
           shots         = 0,
           killer        = nil}
end

function reset_player(player)
   local x,y = new_player_position()
   player.x           = x
   player.y           = y
   player.u           = 0
   player.v           = 0
   player.speed       = 0
   player.tank_pos    = 0
   player.turret_pos  = 0
   player.shot_ttl    = 0
   player.shield      = tank_shield
   player.key_pressed = 0
   player.killer      = nil
end

function initialize(roomId, config)
   reflex.loginfo("Initializing script for room " .. roomId .. "...")
   seed           = reflex.get_room_property("seed")
   match_duration = reflex.get_room_property("match_duration")
   SimplexNoise.init(seed)
   math.randomseed(seed)

   for i = 0,31 do
      angles[i] = math.atan(math.sin(i * math.pi/16) / (0.75 * math.cos(i * math.pi/16)))
      if i > 24 then
         angles[i] = angles[i] + 2 * math.pi
      elseif i > 8 then
         angles[i] = angles[i] + math.pi
      end
   end

   reflex.set_room_property("tile_size",         tile_size)
   reflex.set_room_property("viewport_x",        viewport_x)
   reflex.set_room_property("viewport_y",        viewport_y)
   reflex.set_room_property("map_width",         map_width)
   reflex.set_room_property("map_height",        map_height)
   reflex.set_room_property("noise_factor",      noise_factor)
   reflex.set_room_property("water_threshold",   water_threshold)
   reflex.set_room_property("grass_threshold",   grass_threshold)
   reflex.set_room_property("tank_shield",       tank_shield)
   reflex.set_room_property("tank_max_speed",    tank_max_speed)
   reflex.set_room_property("tank_acceleration", tank_acceleration)
   reflex.set_room_property("tank_pulsatance",   tank_pulsatance)
   reflex.set_room_property("turret_pulsatance", turret_pulsatance)
   reflex.set_room_property("shot_ttl",          shot_ttl)
   reflex.set_room_property("shell_start_speed", shell_start_speed)
   reflex.set_room_property("shell_min_speed",   shell_min_speed)
   reflex.set_room_property("shell_acceleration",shell_acceleration)
   reflex.set_room_property("shell_dammage",     shell_dammage)
   reflex.set_room_property("collision_dammage", collision_dammage)
   reflex.set_room_property("respawn_ttl",       respawn_ttl)
end

function deinitialize()
   reflex.loginfo("Deinitializing script")
end

function on_room_joined(playerId)
   reflex.loginfo("Player " .. playerId .. " joined the room")
   players[playerId] = new_player(playerId)
end

function on_room_left(playerId)
   reflex.loginfo("Player " .. playerId .. " left the room")
   local props = reflex.get_room_properties()
   for k,v in pairs(props) do
      if string.match(k, playerId) ~= nil then
         reflex.set_room_property(k, nil)
      end
   end
   players[playerId] = nil
end

function on_message_received(message)
   if message.tag == 100 then
      if players[message.from] ~= nil then
         players[message.from].key_pressed = message.payload.key_pressed
      end
      return false
   end
   return true
end

function on_match_state_changed(matchState)
   if matchState == "READY" then
      if match_timer == nil then
         reflex.start_match()
      end
   elseif matchState == "RUNNING" then
      if match_timer == nil then
         match_timer = reflex.set_timeout({action="stop"}, match_duration)
      end
   elseif matchState == "FINISHED" then
      if reflex.count_room_participants() == 0 then
         players = {}
         if match_timer ~= nil then
            reflex.clear_timeout(match_timer)
            match_timer = nil
         end
      else
         local payload = {}
         for id, player in pairs(players) do
            payload["score_" .. id] = player.frags .. "#" .. player.deaths .. "#" .. player.hits .. "#" .. player.shots
            players[id] = new_player(id)
         end

         reflex.send_message({to       = nil,
                              tag      = 203,
                              reliable = true,
                              payload  = payload})
      end
      shells = {}
      reflex.reset_match()
      match_timer = reflex.set_timeout({action="start", ttl=10}, 1000)
   end
end

function on_property_updated(key, value)
end

function on_timeout(id, info)
   if id == match_timer and info.action == "start" then
      local payload = {start_countdown = info.ttl}
      reflex.send_message({to       = nil,
                           tag      = 202,
                           reliable = true,
                           payload  = payload})

      if info.ttl > 0 then
         info.ttl = info.ttl - 1
         match_timer = reflex.set_timeout(info, 1000)
      else
         match_timer = nil
         reflex.start_match()
      end
   elseif id == match_timer and info.action == "stop" then
      reflex.stop_match()
   end
end

function move_players()
   local time    = os.time()
   for id,player in pairs(players) do
      if player.respawn_ttl > 0 then
         player.respawn_ttl = player.respawn_ttl - 1
      else


         if bit32.band(player.key_pressed, TANK_LEFT) == TANK_LEFT then
            if bit32.band(player.key_pressed, TANK_BOTTOM) == TANK_BOTTOM then
               player.tank_pos = (player.tank_pos + 1) % 32
            else
               player.tank_pos = (32 + player.tank_pos - 1) % 32
            end
         elseif bit32.band(player.key_pressed, TANK_RIGHT) == TANK_RIGHT then
            if bit32.band(player.key_pressed, TANK_BOTTOM) == TANK_BOTTOM then
               player.tank_pos = (32 + player.tank_pos - 1) % 32
            else
               player.tank_pos = (player.tank_pos + 1) % 32
            end
         end

         if bit32.band(player.key_pressed, TANK_TOP) == TANK_TOP then
            if player.speed >= 0 then
               player.speed = math.min(tank_max_speed, player.speed + tank_acceleration)
            else
               player.speed = math.min(0, player.speed - tank_breaking_speed)
            end
         elseif bit32.band(player.key_pressed, TANK_BOTTOM) == TANK_BOTTOM then
            if player.speed <= 0 then
               player.speed = math.max(tank_max_reverse_speed, player.speed - tank_acceleration)
            else
               player.speed = math.max(0, player.speed + tank_breaking_speed)
            end
         else
            if player.speed <= 0 then
               player.speed = math.min(0, player.speed - tank_breaking_speed)
            else
               player.speed = math.max(0, player.speed + tank_breaking_speed)
            end
         end

         if bit32.band(player.key_pressed, TURRET_LEFT) == TURRET_LEFT then
            player.turret_pos = (32 + player.turret_pos - 1) % 32
         elseif bit32.band(player.key_pressed, TURRET_RIGHT) == TURRET_RIGHT then
            player.turret_pos = (player.turret_pos + 1) % 32
         elseif player.shot_ttl == 0 and bit32.band(player.key_pressed, FIRE) == FIRE then
            shells[id .. "-" .. time] = {id    = id,
                                         x     = player.x,
                                         y     = player.y,
                                         hit   = false,
                                         pos   = (player.tank_pos + player.turret_pos) % 32,
                                         speed = shell_start_speed}
            player.shot_ttl = shot_ttl
            player.shots    = player.shots + 1
         end

         if player.shot_ttl > 0 then
            player.shot_ttl = player.shot_ttl - 1
         end

         local tank_angle = angles[player.tank_pos]
         local x = player.x - player.speed * math.sin(tank_angle + math.pi)
         local y = player.y + player.speed * math.cos(tank_angle + math.pi)
         if is_walkable(x, y) then
            player.u = x - player.x
            player.v = y - player.y
            player.x = x
            player.y = y
         else
            player.u     = 0
            player.v     = 0
            player.speed = 0
         end
      end
   end
end

function move_shells()
   for id,shell in pairs(shells) do
      local shell_angle = angles[shell.pos]
      shell.x     = shell.x - shell.speed * math.sin(shell_angle + math.pi)
      shell.y     = shell.y + shell.speed * math.cos(shell_angle + math.pi)
      shell.speed = math.max(shell_min_speed, shell.speed + shell_acceleration)
   end
end

function check_tank_collisions(player)
   local d = 70/factor

   for id,opponent in pairs(players) do
      if id == player.id then
         return false
      end
      local a = math.sqrt(math.pow(player.x - opponent.x, 2) + math.pow(player.y - opponent.y, 2))
      if a < d then
         return true, opponent
      end
   end
   return false
end


function check_shell_hits(player)
   local d = 70/factor

   for id,shell in pairs(shells) do
      if shell.id ~= player.id then
         local a = math.sqrt(math.pow(player.x - shell.x, 2) + math.pow(player.y - shell.y, 2))
         if a < d then
            return true, shell
         end
      end
   end
   return false
end

function on_tick()
   if reflex.get_match_state() ~= "RUNNING" then
      return nil
   end

   local payload = {}
   move_players()
   move_shells()

   local start_time = reflex.get_mm_time()

   for id,player in pairs(players) do
      local b, opponent = check_tank_collisions(player)
      if b then
         local dammage   = collision_dammage * math.abs(opponent.speed-player.speed) / tank_max_speed
         player.shield   = player.shield   - dammage
         opponent.shield = opponent.shield - dammage

         if player.shield > 0 then
            player.speed = player.speed / 2
            player.x = player.x + 2 * opponent.u
            player.y = player.y + 2 * opponent.v
         else
            opponent.frags = opponent.frags + 1
            player.killer  = opponent.id
         end

         if opponent.shield > 0 then
            opponent.speed = opponent.speed / 2
            opponent.x = opponent.x + 2 * player.u
            opponent.y = opponent.y + 2 * player.v
         else
            player.frags    = player.frags + 1
            opponent.killer = player.id
         end
      end

      local b, shell = check_shell_hits(player)
      if b then
         player.shield          = player.shield - shell_dammage
         shell.hit              = true
         players[shell.id].hits = players[shell.id].hits + 1
         if player.shield > 0 then
            if player.speed > 0 then
               player.speed  = math.max(-2/factor, player.speed - shell.speed/10)
            elseif player.speed < 0 then
               player.speed  = math.min(2/factor, player.speed + shell.speed/10)
            end
         else
            players[shell.id].frags = players[shell.id].frags + 1
            player.killer           = shell.id
         end
      end
   end

   local t1 = reflex.get_mm_time()

   for id,player in pairs(players) do
      if player.shield <= 0 then
         payload["explosion_" .. id] = player.x .. "#" .. player.y .. "#" .. player.killer
         reset_player(player)
         player.respawn_ttl = respawn_ttl
         player.deaths      = player.deaths + 1
      elseif player.respawn_ttl == 0 then
         payload["player_" .. id] = player.x .. "#"
            .. player.y          .. "#"
            .. player.tank_pos   .. "#"
            .. player.turret_pos .. "#"
            .. player.shield
      end
      payload["score_" .. id] = player.frags .. "#" .. player.deaths .. "#" .. player.hits .. "#" .. player.shots
   end

   local t2 = reflex.get_mm_time()

   for id,shell in pairs(shells) do
      if shell.hit then
         payload["hit_" .. id] = shell.x .. "#" .. shell.y
         shells[id] = nil
      elseif shell.speed > shell_min_speed then
         payload["shell_" .. id] = shell.x .. "#" .. shell.y .. "#" .. shell.pos
      else
         payload["missed_" .. id] = shell.x .. "#" .. shell.y
         shells[id] = nil
      end
   end

   local t3 = reflex.get_mm_time()

   reflex.send_message({to       = nil,
                        tag      = 201,
                        reliable = false,
                        payload  = payload})

   local end_time = reflex.get_mm_time()

   if (end_time - start_time) > 10 then
      reflex.loginfo(end_time - start_time, ":",
                     t1 - start_time, "/",
                     t2 - t1, "/",
                     t3 - t2, "/",
                     end_time - t3)
   end
end

reflex.loginfo("my script is loaded!")
