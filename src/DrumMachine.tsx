import React from 'react';
import './DrumMachine.scss';
import AudioEngine, { browserSupportsWebAudio, Position } from './AudioEngine';
import { Pattern, patterns, Track } from './Patterns';
import { useStateIfMounted } from './UseStateIfMounted';
import { Button, Card, Container, LoadingOverlay, Select, SimpleGrid, Title } from '@mantine/core';
import { useAsyncEffect } from './Async';

interface SelectablePattern {
  value: string,
  label: string
}

const DrumMachine: React.FC = () => {
  const [loading, setLoading] = useStateIfMounted<boolean>(true);
  const [playing, setPlaying] = useStateIfMounted<boolean>(true);
  const [position, setPosition] = useStateIfMounted<Position>();
  const [error, setError] = useStateIfMounted<any>();
  const [audioEngine, setAudioEngine] = useStateIfMounted<AudioEngine>();
  const [pattern, setPattern] = useStateIfMounted<Pattern>();
  const [selectedPattern, setSelectedPattern] = useStateIfMounted<string>('');
  const [selectablePatterns, setSelectablePatterns] = useStateIfMounted<SelectablePattern[]>([])

  useAsyncEffect(async () => {
    if (!browserSupportsWebAudio()) {
      setLoading(false);
      setError('This browser does not support WebAudio. Try Edge, Firefox, Chrome or Safari.');
    }

    const audioEngine = new AudioEngine(onStep);
    setAudioEngine(audioEngine);
    try {
      await audioEngine?.prepare();
    } catch (error) {
      setError(true);
      setLoading(false);
    }

    const selectablePatterns = patterns.map(pattern => ({ label: pattern.name, value: pattern.name }))
    setSelectablePatterns(selectablePatterns);
  }, []);

  React.useEffect(() => {
    if (audioEngine && selectablePatterns.length > 0) {
      const randomIndex = Math.floor(Math.random() * selectablePatterns.length);
      setSelectedPattern(selectablePatterns[randomIndex].value)
    }
    setLoading(false);
  }, [audioEngine, selectablePatterns]);

  React.useEffect(() => {
    if (selectedPattern) {
      const pattern = patterns.find(pattern => pattern.name === selectedPattern)!;
      if (playing) {
        stopClock();
      }
      setPattern(pattern);
      audioEngine?.setPattern(pattern);
    }

  }, [selectedPattern]);

  const startClock = () => {
    audioEngine?.startClock(pattern?.beatsPerMinute ?? 0);

    setPlaying(true);
  };

  const stopClock = () => {
    audioEngine?.stopClock();
    setPlaying(false);
  };

  const onStep = (position: Position) => {
    setPosition(position);
  };

  if (error) {
    return <div className="drum-machine__Error">{error}</div>;
  }

  return (
    <Container>
      <Card shadow="sm" padding="sm" className="drum-machine">
        <LoadingOverlay visible={loading} />
        {!loading && (
          <>
            <Container className="top-panel" padding={0}>
              <Select
                label="Pattern"
                onChange={(value: string) => setSelectedPattern(value)}
                placeholder="Pick one"
                value={selectedPattern}
                data={selectablePatterns}
              />
              <Button disabled={playing} className="drum-machine__StartStopButton" onClick={startClock}>
                Start
              </Button>
              <Button disabled={!playing} className="drum-machine__StartStopButton" onClick={stopClock}>
                Stop
              </Button>
            </Container>

            <SimpleGrid spacing='xs'>
              {pattern?.tracks.map((track: Track, trackIndex: number) => (
                <TrackComponent track={track} currentStep={position?.step} key={trackIndex} />
              ))}
            </SimpleGrid>
          </>
        )}
      </Card>
    </Container>
  );
};

interface TrackComponentProps {
  track: Track,
  currentStep?: number,
}

const TrackComponent: React.FC<TrackComponentProps> = ({ track, currentStep }) => {
  return (<Card padding='xs' shadow='sm' withBorder className='track-component'>
    <Title order={3} className='title'>
      {track.instrument}
    </Title>
    <div className="drum-machine__TrackSteps">
      {track.steps.map((trackStep, i) => (
        <StepComponent currentStep={currentStep} enabled={trackStep === 0 ? false : true} stepIndex={i} key={i} />
      ))}
    </div>
  </Card>);
}

interface StepComponentProps {
  enabled: boolean,
  currentStep?: number,
  stepIndex: number
}

const StepComponent: React.FC<StepComponentProps> = ({ enabled, currentStep, stepIndex }) => {
  return (<div
    className={`drum-machine__Step drum-machine__Step--${currentStep === stepIndex ? 'Active' : 'Inactive'} drum-machine__Step--${enabled ? 'On' : 'Off'
      }`}
  />)
}

export default DrumMachine;
