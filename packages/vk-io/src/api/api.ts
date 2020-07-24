import { inspectable } from 'inspectable';

import { APIMethods } from './schemas/methods';

import { VK } from '../vk';
import { APIManager } from './manager';
import { APIRequest } from './request';

const groupMethods = [
	'account',
	'ads',
	'appWidgets',
	'apps',
	'audio',
	'auth',
	'board',
	'database',
	'docs',
	'fave',
	'friends',
	'gifts',
	'groups',
	'leads',
	'leadForms',
	'likes',
	'market',
	'messages',
	'newsfeed',
	'notes',
	'notifications',
	'orders',
	'pages',
	'photos',
	'places',
	'polls',
	'podcasts',
	'prettyCards',
	'search',
	'secure',
	'stats',
	'status',
	'storage',
	'stories',
	'streaming',
	'users',
	'utils',
	'video',
	'wall',
	'widgets',
	'junction'
];

/**
 * Working with API methods
 */
class API {
	private vk: VK;

	private manager: APIManager;

	public options: VK['options'];

	/**
	 * Constructor
	 */
	public constructor(vk: VK) {
		this.vk = vk;
		this.options = vk.options;
		this.manager = new APIManager(this);

		this.vk.internalHooks.on('update_options', ({ keys }: { keys: string[] }) => {
			if (!keys.includes('apiMode')) {
				return;
			}

			this.manager.updateWorker();
		});

		for (const group of groupMethods) {
			// @ts-expect-error
			this[group] = new Proxy(Object.create(null), {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				get: (obj, prop: string) => (params: object): Promise<any> => (
					this.manager.callWithRequest(new APIRequest({
						api: this,
						method: `${group}.${prop}`,
						params
					}))
				)
			});
		}
	}

	/**
	 * Returns custom tag
	 */
	public get [Symbol.toStringTag](): string {
		return this.constructor.name;
	}

	/**
	 * Call execute method
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public execute(params: Record<string, unknown> & { code: string }): Promise<any> {
		return this.call('execute', params);
	}

	/**
	 * Call execute procedure
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public procedure(name: string, params: object): Promise<any> {
		return this.call(`execute.${name}`, params);
	}

	/**
	 * Call raw method
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public call(method: string, params: object): Promise<any> {
		return this.manager.callWithRequest(new APIRequest({
			method,
			params,

			api: this
		}));
	}

	/**
	 * Adds request for queue
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public callWithRequest(request: APIRequest): Promise<any> {
		return this.manager.callWithRequest(request);
	}
}

inspectable(API);

// eslint-disable-next-line
interface API extends APIMethods {}

export { API };
