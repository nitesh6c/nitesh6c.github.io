import { useState, useEffect, useCallback, PropsWithChildren } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadUserCompetitions } from '@/containers/MyCompetitions/MyCompetitions.query';
import { fetchMe } from '@/lib/api';
import { appOriginPath } from '@/lib/appBase';
import history from '@/lib/history';
import { getLocalStorage, localStorageKey, setLocalStorage } from '@/lib/localStorage';
import { WCA_OAUTH_CLIENT_ID, WCA_OAUTH_ORIGIN } from '@/lib/wca-env';
import { queryClient } from '../QueryProvider';
import { AuthContext } from './AuthContext';

const OAUTH_STATE_KEY = 'wca_oauth_state';
const OAUTH_REDIRECT_PATH_KEY = 'redirect';

/**
 * Redirect URI registered with the WCA OAuth application.
 * Supports GitHub Pages base paths and optional ?staging=true.
 */
const oauthRedirectUri = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const stagingParam = searchParams.has('staging');
  const base = appOriginPath();
  return stagingParam ? `${base}?staging=true` : base;
};

const signIn = () => {
  window.localStorage.setItem(
    OAUTH_REDIRECT_PATH_KEY,
    `${window.location.pathname}${window.location.search}`,
  );

  const state = crypto.randomUUID();
  sessionStorage.setItem(OAUTH_STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: WCA_OAUTH_CLIENT_ID,
    response_type: 'token',
    redirect_uri: oauthRedirectUri(),
    scope: 'public',
    state,
  });

  window.location.href = `${WCA_OAUTH_ORIGIN}/oauth/authorize?${params.toString()}`;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(() => {
    const rawUserData = getLocalStorage('user');
    return rawUserData ? (JSON.parse(rawUserData) as User) : null;
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const signOut = () => {
    setUser(null);
    setAuthError(null);
    localStorage.removeItem(localStorageKey('accessToken'));
    localStorage.removeItem(localStorageKey('expirationTime'));
    localStorage.removeItem(localStorageKey('user'));
    localStorage.removeItem(localStorageKey('my.upcoming_competitions'));
    localStorage.removeItem(localStorageKey('my.ongoing_competitions'));
    queryClient.removeQueries({ queryKey: ['userCompetitions'] });
    queryClient.removeQueries({ queryKey: ['user-results'] });
    queryClient.removeQueries({ queryKey: ['user-past-competitions'] });
    queryClient.removeQueries({ queryKey: ['user-profile'] });
    queryClient.removeQueries({ queryKey: ['user-assignment-status'] });
  };

  const signInAs = useCallback(
    (userId: number) => {
      queryClient.removeQueries({ queryKey: ['userCompetitions'] });

      loadUserCompetitions(userId.toString()).then((userComps) => {
        setUser(userComps.user);
        queryClient.setQueryData(['userCompetitions', userComps.user.id], userComps);
        navigate('/', { replace: true });
      });
    },
    [navigate],
  );

  const setUserAndSave = useCallback((nextUser: User) => {
    setLocalStorage('user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    void queryClient.prefetchQuery({
      queryKey: ['userCompetitions', user.id],
      queryFn: () => loadUserCompetitions(user.id.toString()),
    });
  }, [user?.id]);

  useEffect(() => {
    const hash = location.hash.replace(/^#/, '');
    if (!hash) {
      return;
    }

    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('access_token');
    const error = hashParams.get('error');

    history.replace({ ...history.location, hash: undefined });

    if (error) {
      setAuthError(hashParams.get('error_description') ?? error);
      return;
    }

    if (!accessToken) {
      return;
    }

    const state = hashParams.get('state');
    const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);

    if (!expectedState || state !== expectedState) {
      setAuthError('Sign in failed: invalid OAuth state. Please try again.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    fetchMe(accessToken)
      .then(async ({ me }) => {
        setLocalStorage('accessToken', accessToken);
        setLocalStorage(
          'expirationTime',
          String(Date.now() + Number(hashParams.get('expires_in') ?? 0) * 1000),
        );
        setUserAndSave(me);

        const userComps = await loadUserCompetitions(me.id.toString());
        queryClient.setQueryData(['userCompetitions', me.id], userComps);

        const redirectPath = window.localStorage.getItem(OAUTH_REDIRECT_PATH_KEY) || '/';
        window.localStorage.removeItem(OAUTH_REDIRECT_PATH_KEY);
        navigate(redirectPath, { replace: true });
      })
      .catch((err) => {
        console.error(err);
        setAuthError('Sign in failed. Please try again.');
      })
      .finally(() => {
        setIsAuthenticating(false);
      });
  }, [location.hash, navigate, setUserAndSave]);

  const value = {
    user,
    setUser: setUserAndSave,
    signIn,
    signOut,
    signInAs,
    authError,
    isAuthenticating,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
