defmodule Drumbot do
	alias Drumbot.Util
	alias Drumbot.MusicPlayer

	def show_songs(), do: Util.get("/")
	def play_song(song) do
		"/#{song}"
		  |> Util.get()
		  |> Util.build_model()
	end

	def fake_play() do
		song =
		%Drumbot.Song{
			duration: 110,
			name: "oontza",
			tracks: [
				%{
					"instrument" => "hihat",
					"steps" => [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1]
				},
				%{
					"instrument" => "snare",
					"steps" => [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
				},
				%{
					"instrument" => "kick",
					"steps" => [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]
				}
			]
		}
		_ = MusicPlayer.start_link({0, song})
		MusicPlayer.play()
	end

end
