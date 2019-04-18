import { Badger, BadgeState } from "../../badge/api";
import { CrossScriptMessenger, Message } from "../../messaging/api";
import { Notifier } from "../../notifications/api";
import { LoadedState } from "../../storage/loaded-state";
import {
  MuteConfiguration,
  NOTHING_MUTED
} from "../../storage/mute-configuration";

export function buildTestingEnvironment() {
  const store = fakeStore();
  const githubLoader = jest.fn<
    Promise<LoadedState>,
    [string, LoadedState | null]
  >();
  githubLoader.mockRejectedValue(
    new Error("GitHub loader called without specifying mock behaviour")
  );
  const notifier = fakeNotifier();
  const badger = fakeBadger();
  const messenger = fakeMessenger();
  const self = {
    store,
    githubLoader,
    notifier,
    badger,
    messenger,
    isOnline: () => self.online,
    online: true
  };
  return self;
}

function fakeStore() {
  return {
    lastError: fakeStorage<string | null>(null),
    lastCheck: fakeStorage<LoadedState | null>(null),
    muteConfiguration: fakeStorage<MuteConfiguration>(NOTHING_MUTED),
    notifiedPullRequests: fakeStorage<string[]>([]),
    token: fakeStorage<string | null>(null)
  };
}

function fakeStorage<T>(defaultValue: T) {
  const self = {
    currentValue: defaultValue,
    loadCount: 0,
    saveCount: 0,
    load: async () => {
      self.loadCount++;
      return self.currentValue;
    },
    save: async (value: T) => {
      self.saveCount++;
      self.currentValue = value;
    }
  };
  return self;
}

function fakeNotifier() {
  const notified: Array<string[]> = [];
  const notifier: Notifier = {
    notify(unreviewedPullRequests) {
      notified.push(unreviewedPullRequests.map(pr => pr.htmlUrl));
    },
    registerClickListener: jest.fn<void, []>()
  };
  return {
    ...notifier,
    notified
  };
}

function fakeBadger() {
  const updated: BadgeState[] = [];
  const badger: Badger = {
    update(state) {
      updated.push(state);
    }
  };
  return {
    ...badger,
    updated
  };
}

function fakeMessenger() {
  const sent: Message[] = [];
  const listeners: Array<(message: Message) => void> = [];
  const messenger: CrossScriptMessenger = {
    listen(listener) {
      listeners.push(listener);
    },
    send(message) {
      sent.push(message);
    }
  };
  return {
    ...messenger,
    sent,
    trigger(message: Message) {
      for (const listener of listeners) {
        listener(message);
      }
    }
  };
}
