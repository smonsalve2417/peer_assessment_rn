import { LocalPreferencesAsyncStorage } from '@/src/core/LocalPreferencesAsyncStorage';
import { Container } from '@/src/core/di/container';
import { TOKENS } from '@/src/core/di/tokens';
import { RemoteEvalFormDatasource } from '../../data/datasources/remote_eval_form_datasource';
import { EvalFormRepositoryImpl } from '../../data/repositories/eval_form_repository_impl';

export class EvalFormBinding {
  static register(c: Container): void {
    const prefs = LocalPreferencesAsyncStorage.getInstance();
    const remote = new RemoteEvalFormDatasource(prefs);
    const repo = new EvalFormRepositoryImpl(remote);
    c.register(TOKENS.EvalFormRepo, repo);
  }
}
