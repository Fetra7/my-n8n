import { ref, readonly } from 'vue';
import { defineStore } from 'pinia';
import { useRootStore } from '@n8n/stores/useRootStore';
import * as provisioningApi from '@n8n/rest-api-client/api/provisioning';
import type {
	ProvisioningConfig,
	ProvisioningConfigPatch,
} from '@n8n/rest-api-client/api/provisioning';

/**
 * Composable to load and save provisioning config
 */
export const useUserRoleProvisioningStore = defineStore('userRoleProvisioning', () => {
	const rootStore = useRootStore();

	const provisioningConfig = ref<ProvisioningConfig | undefined>();

	const getProvisioningConfig = async () => {
		try {
			const config = await provisioningApi.getProvisioningConfig(rootStore.restApiContext);
			provisioningConfig.value = config;
			return config;
		} catch (error) {
			const status = (error as any)?.response?.status;
			if (status === 404 || status === 403) {
				console.warn('SSO User Role Provisioning is not licensed or enabled.');
			} else {
				console.error('Failed to fetch provisioning config:', error);
			}
			return;
		}
	};

	const saveProvisioningConfig = async (config: ProvisioningConfigPatch) => {
		try {
			const updatedConfig = await provisioningApi.saveProvisioningConfig(
				rootStore.restApiContext,
				config,
			);
			provisioningConfig.value = updatedConfig;
			return updatedConfig;
		} catch (error) {
			console.error('Failed to save provisioning config:', error);
			throw error;
		}
	};

	return {
		provisioningConfig: readonly(provisioningConfig),
		getProvisioningConfig,
		saveProvisioningConfig,
	};
});
